const BASE_URL = ''; // Relative to origin because of Vite proxy

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('kint_token');
  
  // Standalone mode: don't even try to hit the proxy if it's a mock session
  if (token && token.startsWith('mock-token-')) {
    throw new Error('STANDALONE_MODE');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('kint_token');
    try {
      window.dispatchEvent(new CustomEvent('unauthorized'));
    } catch {
      // Fallback for environments where CustomEvent might fail as a constructor
      const event = document.createEvent('Event');
      event.initEvent('unauthorized', true, true);
      window.dispatchEvent(event);
    }
  }

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('Failed to parse JSON:', text);
      data = { message: 'Invalid response from server' };
    }
  } else {
    data = { message: await response.text() || 'Request failed' };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, options) => apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, options) => apiFetch(url, { ...options, method: 'DELETE' }),
};
