import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useTheme, useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Sun, 
  Moon, 
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2
} from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  
  const { login, register } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Session sync: logout in one tab should logout in all
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'kint_token' && !e.newValue) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const validateUsername = (name) => {
    return /^[a-zA-Z0-9._]+$/.test(name);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    if (pass.length < 6) return 'weak';
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSymbols = /[!@#$%^&*]/.test(pass);
    if (hasLetters && hasNumbers && hasSymbols && pass.length >= 8) return 'strong';
    if (hasLetters && hasNumbers) return 'medium';
    return 'weak';
  };

  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const length = phoneNumber.length;
    if (length < 2) return `+7`;
    if (length < 5) return `+7 (${phoneNumber.slice(1)}`;
    if (length < 8) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (length < 10) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 18) setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (lockoutTimer > 0) {
      setError(language === 'ru' ? `Слишком много попыток. Подождите ${lockoutTimer} сек.` : `Too many attempts. Wait ${lockoutTimer}s.`);
      return;
    }

    if (!email || (!isForgotPassword && !password) || (!isLogin && (!name || !phone))) {
      setError(t('auth.fillAllFields', language));
      return;
    }

    if (!validateEmail(email)) {
      setError(language === 'ru' ? 'Введите корректный email (например, name@mail.ru)' : 'Please enter a valid email (e.g., name@mail.com)');
      return;
    }

    if (!isLogin && !validateUsername(name)) {
      setError(t('common.usernameRestriction', language));
      return;
    }

    if (!isLogin && !agreedToTerms) {
      setError(language === 'ru' ? 'Вы должны согласиться с правилами' : 'You must agree to the terms');
      return;
    }

    if (isForgotPassword) {
      navigate('/forgot-password');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError(t('auth.passwordsNotMatch', language));
      return;
    }

    try {
      if (isLogin) {
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/feed');
      } else {
        await register(name, email, password);
        navigate('/feed');
      }
    } catch {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= 3) {
        setLockoutTimer(30);
        setFailedAttempts(0);
      }
      setError(t('auth.invalidCredentials', language));
    }
  };

  const inputClass = (isError) => `
    w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 outline-none
    ${isError ? 'border-red-500 bg-red-500/5' : ''}
    ${theme === 'dark' 
      ? 'bg-gray-900/50 border-gray-700 text-white focus:border-cyan-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-600 shadow-inner'}
  `;

  const strength = getPasswordStrength(password);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-500 flex items-center justify-center px-4 overflow-hidden relative`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-15 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
      </div>

      <div className="fixed top-6 left-6 right-6 flex items-center justify-between z-50">
        <Link to="/landing" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}>
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm hidden sm:inline">{language === 'ru' ? 'На главную' : 'Back to Landing'}</span>
        </Link>
        <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-gray-900 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-2xl border p-8 md:p-10 ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-gray-50/80 border-white'}`}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">
              {isForgotPassword ? (language === 'ru' ? 'Сброс' : 'Reset') : isLogin ? t('auth.signIn', language) : t('auth.signUp', language)}
            </h1>
          </div>

          {error && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-red-500 bg-red-500/10 border border-red-500/20`}>
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder={t('profile.name', language) || 'Username'} value={name} onChange={(e) => setName(e.target.value)} className={inputClass(!validateUsername(name) && name)} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="text" placeholder={t('common.phone', language)} value={phone} onChange={handlePhoneChange} className={inputClass()} />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input type="email" placeholder={t('auth.email', language)} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(email && !validateEmail(email))} />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type={showPassword ? "text" : "password"} placeholder={t('auth.password', language)} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass(password && password.length < 6)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-cyan-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && password && (
                  <div className="px-1 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
                      <span>{t('common.passwordStrength', language)}:</span>
                      <span className={strength === 'strong' ? 'text-green-500' : strength === 'medium' ? 'text-yellow-500' : 'text-red-500'}>
                        {t(`common.${strength}`, language)}
                      </span>
                    </div>
                    <div className="h-1 flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${password ? (strength === 'weak' ? 'bg-red-500' : strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength === 'medium' || strength === 'strong' ? (strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input type={showPassword ? "text" : "password"} placeholder={t('auth.confirmPassword', language)} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass(confirmPassword && password !== confirmPassword)} />
              </div>
            )}

            {!isLogin && (
              <label className="flex items-center gap-3 cursor-pointer p-1 group">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-gray-300'}`}>
                  {agreedToTerms && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} />
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors">{t('common.agreeToTerms', language)}</span>
              </label>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-gray-400 hover:text-cyan-500 transition-colors uppercase tracking-widest">{t('auth.forgotPassword', language)}</button>
              </div>
            )}

            <button type="submit" disabled={lockoutTimer > 0} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale">
              {isForgotPassword ? t('auth.continue', language) : isLogin ? t('auth.signIn', language) : t('auth.signUp', language)}
            </button>

            {isForgotPassword && (
               <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full py-3 text-xs font-black text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">
                 {t('auth.cancel', language)}
               </button>
            )}
          </form>

          {!isForgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-400">
                {isLogin ? t('auth.noAccount', language) : t('auth.haveAccount', language)}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 text-cyan-500 hover:text-blue-600 font-bold transition-colors">
                  {isLogin ? t('auth.signUp', language) : t('auth.signIn', language)}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
