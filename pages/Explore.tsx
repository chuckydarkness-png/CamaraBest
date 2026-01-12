
import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../services/realtime';
import { UserProfile } from '../types';
import { translations, Language } from '../services/translations';
import { Search, UserPlus, UserCheck, TrendingUp, Sparkles } from 'lucide-react';

export const Explore: React.FC = () => {
  const [suggested, setSuggested] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState(RealtimeService.getCurrentUser());
  const [lang] = useState<Language>(RealtimeService.getLanguage());
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    setSuggested(RealtimeService.getSuggestedUsers());
    const handleUpdate = () => {
      setCurrentUser(RealtimeService.getCurrentUser());
    };
    window.addEventListener('user_updated', handleUpdate);
    return () => window.removeEventListener('user_updated', handleUpdate);
  }, []);

  const handleToggleFriend = (id: string) => {
    RealtimeService.toggleFriend(id);
  };

  const isFollowing = (id: string) => currentUser.friends?.includes(id);

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">{t.explore}</h2>
        <TrendingUp className="text-cyan-400" size={24} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          placeholder="Search creators..."
          className="w-full bg-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none border border-zinc-800 focus:border-cyan-500/30 transition-all"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={14} className="text-pink-500" /> Suggested for you
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {suggested.map(user => (
            <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <img src={user.avatar} className="w-20 h-20 rounded-full border-2 border-zinc-800" alt="" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm truncate w-full">{user.name}</h4>
                <p className="text-[10px] text-zinc-500">@{user.username}</p>
              </div>
              <button 
                onClick={() => handleToggleFriend(user.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isFollowing(user.id)
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    : 'bg-white text-black hover:scale-105 active:scale-95'
                }`}
              >
                {isFollowing(user.id) ? (
                  <><UserCheck size={14} /> {t.remove_friend}</>
                ) : (
                  <><UserPlus size={14} /> {t.add_friend}</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['#AICamera', '#Vaporwave', '#Cyberpunk', '#GeminiAI', '#Nature', '#Edit', '#VEO'].map(tag => (
            <span key={tag} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
