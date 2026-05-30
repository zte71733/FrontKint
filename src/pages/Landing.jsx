import { useTheme } from '../context/Contexts';
import { useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  Flame, 
  Zap, 
  Sun, 
  Moon,
  ArrowRight
} from 'lucide-react';
import heroLight from '../assets/hero.png';
import heroDark from '../assets/hero-dark.png';

export default function Landing() {
  const { theme, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { icon: <TrendingUp size={24} />, title: 'common.sport', desc: 'landing.sportDesc' },
    { icon: <Star size={24} />, title: 'common.education', desc: 'landing.educationDesc' },
    { icon: <Zap size={24} />, title: 'common.creativity', desc: 'landing.creativityDesc' },
  ];

  const langBtnClass = (active) => `
    px-3 py-1.5 rounded-lg text-xs font-bold transition-all
    ${active 
        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
        : theme === 'dark' 
        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
  `;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-500 overflow-x-hidden`}>
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full blur-[120px] opacity-10 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
        <div className={`absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-15 ${theme === 'dark' ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950/70 border-gray-800' : 'bg-white/70 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint" className="w-8 h-8 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight">Kint</span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <button onClick={() => setLanguage('en')} className={langBtnClass(language === 'en')}>EN</button>
              <button onClick={() => setLanguage('ru')} className={langBtnClass(language === 'ru')}>РУ</button>
              <button onClick={() => setLanguage('zh')} className={langBtnClass(language === 'zh')}>中文</button>
            </div>
            <button 
              onClick={toggle}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-black uppercase tracking-[0.2em] mb-8 border border-cyan-500/20">
              <Flame size={14} className="animate-pulse" />
              {t('landing.joinEvolution', language)}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              {t('landing.levelUpLife', language).split(t('landing.life', language))[0]}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">{t('landing.life', language)}</span>
              {t('landing.levelUpLife', language).split(t('landing.life', language))[1]}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('landing.heroDesc', language)}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                {t('landing.getStarted', language)}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-gray-900 border border-white/5 hover:bg-gray-800' : 'bg-white shadow-lg border border-gray-100 hover:bg-gray-50'}`}
              >
                {t('landing.signIn', language)}
              </button>
            </div>
          </div>

          <div className="relative h-[500px] flex items-center justify-center">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 blur-[100px] rounded-full animate-pulse"></div>
            
            {/* Main Mockup Card */}
            <div className={`relative w-[280px] md:w-[320px] aspect-[9/16] rounded-[3rem] border transition-all duration-700 shadow-2xl overflow-hidden z-20 ${theme === 'dark' ? 'bg-gray-900/80 border-white/10' : 'bg-white/80 border-white'}`}>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500"><Zap size={16} /></div>
                   <div className="flex gap-2">
                      <div className="w-8 h-2 rounded-full bg-gray-500/20"></div>
                      <div className="w-4 h-2 rounded-full bg-gray-500/20"></div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="h-4 w-2/3 bg-gray-500/20 rounded-full"></div>
                   <div className="h-4 w-full bg-gray-500/10 rounded-full"></div>
                </div>
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-white/5 flex items-center justify-center">
                   <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint" className="w-16 h-16 opacity-40" />
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gray-500/20"></div>
                   <div className="flex-1 space-y-2">
                      <div className="h-2 w-1/3 bg-gray-500/20 rounded-full"></div>
                      <div className="h-2 w-1/2 bg-gray-500/10 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 -left-10 md:-left-20 z-30 animate-float" style={{ animationDelay: '0s' }}>
               <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-950/80 border-white/10' : 'bg-white/80 border-white'}`}>
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center"><TrendingUp size={20} /></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth</p>
                     <p className="text-sm font-black text-green-500">+120 XP</p>
                  </div>
               </div>
            </div>

            <div className="absolute bottom-20 -right-6 md:-right-12 z-30 animate-float" style={{ animationDelay: '1.5s' }}>
               <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-950/80 border-white/10' : 'bg-white/80 border-white'}`}>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center"><Star size={20} /></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quest</p>
                     <p className="text-sm font-black text-purple-500">Completed</p>
                  </div>
               </div>
            </div>

            <div className="absolute -bottom-4 left-10 md:left-20 z-10 animate-float opacity-40 md:opacity-100" style={{ animationDelay: '0.8s' }}>
               <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-white/40 border-white'}`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center"><Zap size={16} /></div>
                  <div className="w-16 h-2 bg-gray-500/20 rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight">{t('landing.builtForGrowth', language)}</h2>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">{t('landing.succeedDesc', language)}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div 
                key={i}
                className={`p-10 rounded-[3rem] border transition-all duration-500 group hover:-translate-y-2 ${theme === 'dark' ? 'bg-gray-900/40 border-white/5 hover:border-cyan-500/30' : 'bg-white border-gray-100 hover:border-cyan-200 shadow-xl shadow-blue-500/5'}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-8 group-hover:scale-110 transition-transform group-hover:rotate-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-4 uppercase">{t(f.title, language)}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{t(f.desc, language)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand CTA Section (Replaced Photo with Logo) */}
      <section className="py-20 px-6 relative">
        <div className={`max-w-7xl mx-auto p-12 md:p-20 rounded-[4rem] border transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-white shadow-2xl shadow-blue-500/10'} text-center overflow-hidden relative`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600"></div>
          
          {/* Large Center Logo instead of a photo */}
          <div className="flex justify-center mb-10">
             <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-in zoom-in duration-700">
               <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint Logo" className="w-20 h-20" />
             </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            {t('landing.readyToStart', language)}
            <br />
            <span className="text-cyan-500">{t('landing.evolution', language)}</span>
          </h2>
          <button 
            onClick={() => navigate('/auth')}
            className="px-12 py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-98 transition-all"
          >
            {t('landing.createAccount', language)}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-20 px-6 border-t ${theme === 'dark' ? 'bg-gray-950 border-gray-900' : 'bg-gray-100 border-gray-300'}`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={toggle}
              className="group relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all"
            >
              <img src={theme === 'dark' ? "/logo-dark.svg" : "/logo.svg"} alt="Kint Logo" className="w-12 h-12" />
              <div className="absolute -top-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                {theme === 'dark' ? <Sun size={12} className="text-yellow-400" /> : <Moon size={12} className="text-gray-600" />}
              </div>
            </button>
            <div className="text-center">
              <p className={`text-sm font-black uppercase tracking-[0.3em] mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>KINT</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-60">© 2026 Kint. All rights reserved.</p>
            </div>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-xs font-black text-gray-500 hover:text-cyan-500 transition-colors uppercase tracking-widest">{t('landing.privacy', language)}</a>
            <a href="#" className="text-xs font-black text-gray-500 hover:text-cyan-500 transition-colors uppercase tracking-widest">{t('landing.terms', language)}</a>
            <a href="#" className="text-xs font-black text-gray-500 hover:text-cyan-500 transition-colors uppercase tracking-widest">{t('landing.contact', language)}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
