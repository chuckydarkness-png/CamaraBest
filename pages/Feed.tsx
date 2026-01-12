
import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../services/realtime';
import { Post, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, UserPlus, UserCheck } from 'lucide-react';
import { translations, Language } from '../services/translations';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(RealtimeService.getCurrentUser());
  const [lang] = useState<Language>(RealtimeService.getLanguage());
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    const loadData = () => {
      setPosts(RealtimeService.getPosts());
      setCurrentUser(RealtimeService.getCurrentUser());
    };
    loadData();
    window.addEventListener('posts_updated', loadData);
    window.addEventListener('user_updated', loadData);
    return () => {
      window.removeEventListener('posts_updated', loadData);
      window.removeEventListener('user_updated', loadData);
    };
  }, []);

  const handleLike = (id: string) => {
    RealtimeService.likePost(id);
  };

  const handleToggleFriend = (userId: string) => {
    RealtimeService.toggleFriend(userId);
  };

  const isFollowing = (userId: string) => {
    return currentUser.friends?.includes(userId);
  };

  return (
    <div className="space-y-6 pb-20">
      {posts.map((post) => (
        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center p-4 gap-3">
            <img src={post.userAvatar} alt={post.username} className="w-10 h-10 rounded-full border border-zinc-700" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{post.username}</h3>
              <p className="text-zinc-500 text-xs">Recently active</p>
            </div>
            {post.userId !== currentUser.id && (
              <button 
                onClick={() => handleToggleFriend(post.userId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isFollowing(post.userId) 
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' 
                    : 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isFollowing(post.userId) ? (
                  <><UserCheck size={14} /> {t.remove_friend}</>
                ) : (
                  <><UserPlus size={14} /> {t.add_friend}</>
                )}
              </button>
            )}
            <button className="text-zinc-500 ml-2"><MoreHorizontal size={20} /></button>
          </div>

          <div className="aspect-[4/5] bg-zinc-900 w-full relative overflow-hidden">
            {post.mediaType === 'image' ? (
              <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
            ) : (
              <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 group">
                <Heart size={24} className={post.likes > 0 ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-active:scale-125 transition-all'} />
                <span className="text-sm font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5">
                <MessageCircle size={24} />
                <span className="text-sm font-bold">{post.comments.length}</span>
              </button>
              <button className="ml-auto"><Share2 size={24} /></button>
            </div>
            <p className="text-sm">
              <span className="font-bold mr-2">{post.username}</span>
              {post.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
