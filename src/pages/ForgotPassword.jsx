import { useState } from 'react';
import { useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../mockData';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = MOCK_USERS.find(a => a.email === email);
    if (user) {
      setEmailSent(true);
    } else {
      setError(t('auth.emailNotFound', language));
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword && newPassword === confirmPassword) {
      setResetDone(true);
      setTimeout(() => navigate('/auth'), 2000);
    } else {
      setError(t('auth.passwordsNotMatch', language));
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-cyan-100'} flex items-center justify-center px-4`}>
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 w-full max-w-md`}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
        </div>

        <h2 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-2xl font-bold text-center mb-6`}>{t('auth.resetPassword', language)}</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!emailSent ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-semibold mb-2`}>{t('auth.email', language)}</label>
              <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`} />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition font-semibold">{t('auth.sendResetLink', language)}</button>
          </form>
        ) : !resetDone ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-semibold mb-2`}>{t('auth.newPassword', language)}</label>
              <input type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`} />
            </div>
            <div>
              <label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block text-sm font-semibold mb-2`}>{t('auth.confirmNewPassword', language)}</label>
              <input type="password" name="confirmNewPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`} />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition font-semibold">{t('auth.reset', language)}</button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-500 font-semibold mb-4">{t('auth.resetSuccess', language)}</p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('auth.redirecting', language)}</p>
          </div>
        )}

        <button onClick={() => navigate('/auth')} className="w-full mt-4 text-cyan-500 hover:text-cyan-600 font-semibold text-sm">
          {t('auth.backToLogin', language)}
        </button>
      </div>
    </div>
  );
}
