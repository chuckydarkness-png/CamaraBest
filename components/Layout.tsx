
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, User, Camera, MessageCircle, Sparkles, Wand2 } from 'lucide-react';
import { RealtimeService } from '../services/realtime';
import { translations, Language } from '../services/translations';
import { CameraView } from './CameraView';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>(RealtimeService.getLanguage());
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const updateLang = () => setLang(RealtimeService.getLanguage());
    window.addEventListener('lang_updated', updateLang);
    return () => window.removeEventListener('lang_updated', updateLang);
  }, []);

  const t = translations[lang] || translations['en'];

  const navItems = [
    { icon: <Home size={22} />, path: '/', label: t.feed },
    { icon: <MessageCircle size={22} />, path: '/messages', label: t.messages },
    { 
      icon: (
        <div className="p-3 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-2xl shadow-lg -mt-8 border-4 border-black group-active:scale-95 transition-transform flex items-center justify-center">
          <Camera size={26} color="white" />
        </div>
      ), 
      onClick: () => setIsCameraOpen(true),
      label: t.camera 
    },
    { icon: <Wand2 size={22} className="text-cyan-400" />, path: '/studio', label: t.studio },
    { icon: <Compass size={22} />, path: '/explore', label: t.explore },
    { icon: <User size={22} />, path: '/profile', label: t.profile },
  ];

  const handleCapture = (blob: Blob, type: 'image' | 'video') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Store in session storage to pass to Studio
      sessionStorage.setItem('pending_media', JSON.stringify({ data: base64data, type }));
      setIsCameraOpen(false);
      navigate('/studio');
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-black shadow-2xl border-x border-zinc-800">
      {isCameraOpen && (
        <CameraView 
          t={t} 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={handleCapture}
        />
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-effect p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black gradient-text tracking-tighter">CameraBest</h1>
        <div className="flex gap-4">
           <Link to="/studio" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-pink-400">
              <Sparkles size={20} />
           </Link>
        </div>
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navbar - Updated to handle 6 items with better spacing */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass-effect border-t border-zinc-800 flex justify-between items-center h-20 px-2 z-50 rounded-t-3xl">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const content = (
            <div className={`flex flex-col items-center justify-center transition-all p-2 ${
              isActive ? 'text-cyan-400 scale-110' : 'text-zinc-500 hover:text-white'
            }`}>
              {item.icon}
              <span className={`text-[8px] mt-1 font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className="flex-1 flex justify-center">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.path} to={item.path!} className="flex-1 flex justify-center">
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
