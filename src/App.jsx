import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { SocketProvider } from './context/SocketContext';
import { useAuth, useTheme, useData, useLanguage } from './context/Contexts';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import UserProfile from './pages/UserProfile';
import Quests from './pages/Quests';
import Clans from './pages/Clans';
import ClanDetail from './pages/ClanDetail';
import Leaderboard from './pages/Leaderboard';
import ClanLeaderboard from './pages/ClanLeaderboard';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import CreateClan from './pages/CreateClan';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { t } from './i18n/translations';
import React from 'react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/home" />;
  if (adminOnly && currentUser?.role !== 'admin') return <Navigate to="/feed" />;
  
  return children;
}

function GlobalErrorToast() {
  const { globalError, clearGlobalError } = useData();
  if (!globalError) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-xs font-black uppercase tracking-tight">{globalError}</p>
        </div>
        <button onClick={clearGlobalError} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

class ErrorBoundaryInternal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    const { language, children } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2 uppercase">{t('common.somethingWentWrong', language)}</h1>
          <p className="text-gray-500 mb-8 max-w-sm">The application encountered an unexpected error and needs to restart.</p>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
          >
            <RefreshCw size={18} /> {t('common.resetAndReload', language)}
          </button>
        </div>
      );
    }
    return children;
  }
}

function ErrorBoundary({ children }) {
  const { language } = useLanguage();
  return <ErrorBoundaryInternal language={language}>{children}</ErrorBoundaryInternal>;
}

function AppContent() {
  return (
    <>
      <GlobalErrorToast />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" />} />
        <Route path="/landing" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/clans" element={<Clans />} />
          <Route path="/clan/:id" element={<ClanDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/clan-leaderboard" element={<ClanLeaderboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/create-clan" element={<CreateClan />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <AuthProvider>
            <DataProvider>
              <SocketProvider>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </SocketProvider>
            </DataProvider>
          </AuthProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}
