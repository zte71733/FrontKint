import { useState, useEffect, useCallback } from 'react';
import { useAuth, SocketContext } from './Contexts';

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.close();
        Promise.resolve().then(() => {
          setSocket(null);
        });
      }
      return;
    }

    const token = localStorage.getItem('kint_token');
    if (token && token.startsWith('mock-token-')) return;

    // SECURITY NOTE: Passing tokens in URL is discouraged as they may be logged.
    // Standard WebSocket doesn't support custom headers in browsers.
    // In a production app, consider using a one-time ticket or sub-protocols.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/social/ws?token=${encodeURIComponent(token)}`;
    
    if (typeof WebSocket === 'undefined') return;

    try {
      const ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setNotifications(prev => [message, ...prev]);
        } catch {
          // Ignore parse errors
        }
      };
      ws.onclose = () => setSocket(null);
      ws.onerror = () => {};
      Promise.resolve().then(() => {
        setSocket(ws);
      });
      return () => ws.close();
    } catch {
      // console.warn('Socket connection skipped');
    }
  }, [isAuthenticated, socket]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}
