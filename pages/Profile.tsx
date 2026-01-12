
import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../services/realtime';
import { translations, languagesList, Language } from '../services/translations';
import { Settings, Grid, Bookmark, Play, Globe, X, UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = RealtimeService.getCurrentUser();
  const allPosts = RealtimeService.getPosts();
  const myPosts = allPosts.filter(p => p.userId === user.id || p.username === user.username);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<Language>(RealtimeService.getLanguage());

  useEffect(() => {
    const updateLang = () => setLang(RealtimeService.getLanguage());
    window.addEventListener('lang_updated', updateLang);
    window.addEventListener('user_updated', updateLang); // Refresh on user state change
    return () => {
      window.removeEventListener('lang_updated', updateLang);
      window.removeEventListener('user_updated', updateLang);
    };
  }, []);

  const t = translations[lang] || translations['en'];

  const handleLanguageChange = (code: Language) => {
    RealtimeService.setLanguage(code);
    setShowSettings(false);
  };

  return (
    <div className="pb-20 relative">
      {/* Profile Header */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-24 h-24 rounded-3xl bg-zinc-800 overflow-hidden border-2 border-zinc-700 p-1">
            <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" alt="Profile" />
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{myPosts.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">{t.posts}</div>
            </div>
            <div>
              <div className="text-lg font-bold">{user.followers}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">{t.followers}</div>
            </div>
            <div>
              <div className="text-lg font-bold">{user.following}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">{t.following}</div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-zinc-400">@{user.username}</p>
          <p className="text-sm pt-2 leading-relaxed text-zinc-300">{user.bio}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-bold hover:bg-zinc-800 transition-all">
            {t.edit_profile}
          </button>
          
          <button 
            onClick={() => navigate('/messages')}
            className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
          >
            <MessageCircle size={20} />
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-3 rounded-2xl transition-all ${showSettings ? 'bg-cyan-500 text-black' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel (Overlay) */}
      {showSettings && (
        <div className="absolute inset-x-0 top-0 z-50 p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="glass-effect rounded-[2rem] p-6 shadow-2xl border-cyan-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe size={20} className="text-cyan-400" />
                {t.settings}
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.language}</label>
              <div className="grid grid-cols-1 gap-2">
                {languagesList.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code as Language)}
                    className={`w-full p-4 rounded-2xl text-left flex justify-between items-center transition-all ${
                      lang === l.code ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-medium">{l.name}</span>
                    {lang === l.code && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-t border-zinc-900 mt-4">
        <button className="flex-1 py-4 flex justify-center border-t-2 border-cyan-500 text-cyan-500">
          <Grid size={22} />
        </button>
        <button className="flex-1 py-4 flex justify-center text-zinc-600">
          <Play size={22} />
        </button>
        <button className="flex-1 py-4 flex justify-center text-zinc-600">
          <Bookmark size={22} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {myPosts.length > 0 ? (
          myPosts.map(post => (
            <div key={post.id} className="aspect-square bg-zinc-900 relative group overflow-hidden">
              {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <video src={post.mediaUrl} className="w-full h-full object-cover" />
              )}
              {post.mediaType === 'video' && <Play className="absolute top-2 right-2 text-white/50" size={16} fill="white" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <span className="text-white font-bold text-sm">❤️ {post.likes}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-20 text-center text-zinc-600">
             <p>No creations yet. Go to Studio!</p>
          </div>
        )}
      </div>
    </div>
  );
};
