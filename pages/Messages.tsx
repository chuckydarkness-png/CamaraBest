
import React, { useState, useEffect, useRef } from 'react';
import { RealtimeService } from '../services/realtime';
import { Conversation, Message } from '../types';
import { translations, Language } from '../services/translations';
// Fix: Added missing MessageCircle to lucide-react imports
import { Search, ChevronLeft, Send, Camera, Image as ImageIcon, Smile, Play, MessageCircle } from 'lucide-react';

export const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [lang] = useState<Language>(RealtimeService.getLanguage());
  const user = RealtimeService.getCurrentUser();
  const t = translations[lang] || translations['en'];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConversations(RealtimeService.getConversations());
    const handleUpdate = () => {
      setConversations(RealtimeService.getConversations());
      if (activeChat) setChatMessages(RealtimeService.getMessages(activeChat));
    };
    window.addEventListener('messages_updated', handleUpdate);
    
    if (activeChat) {
      setChatMessages(RealtimeService.getMessages(activeChat));
    }
    
    return () => window.removeEventListener('messages_updated', handleUpdate);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!activeChat || !newMessageText.trim()) return;
    RealtimeService.sendMessage(activeChat, newMessageText);
    setNewMessageText('');
  };

  const handleSendMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeChat) {
      const type = file.type.startsWith('image') ? 'image' : 'video';
      const reader = new FileReader();
      reader.onloadend = () => {
        RealtimeService.sendMessage(activeChat, undefined, reader.result as string, type);
      };
      reader.readAsDataURL(file);
    }
  };

  if (activeChat) {
    const currentConv = conversations.find(c => c.userId === activeChat);
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col">
        {/* Chat Header */}
        <header className="glass-effect p-4 flex items-center gap-4 border-b border-zinc-800">
          <button onClick={() => setActiveChat(null)}><ChevronLeft size={24} /></button>
          <img src={currentConv?.userAvatar} className="w-10 h-10 rounded-full border border-zinc-700" alt="" />
          <div className="flex-1">
            <h3 className="font-bold text-sm">{currentConv?.username || 'User'}</h3>
            <p className="text-green-500 text-[10px] font-bold uppercase">Online</p>
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map(m => {
            const isMe = m.senderId === user.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${
                  isMe ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                }`}>
                  {m.mediaUrl && (
                    <div className="relative mb-2 group">
                      {m.mediaType === 'image' ? (
                        <img src={m.mediaUrl} className="rounded-lg max-h-60 w-full object-cover shadow-xl" alt="" />
                      ) : (
                        <div className="relative">
                          <video src={m.mediaUrl} className="rounded-lg max-h-60 w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play fill="white" className="text-white opacity-80" size={32} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {m.text && <p>{m.text}</p>}
                  <div className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 pb-8 glass-effect border-t border-zinc-800 flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-500 hover:text-white"
          >
            <Camera size={24} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleSendMedia} 
            className="hidden" 
            accept="image/*,video/*"
          />
          <div className="flex-1 bg-zinc-900 rounded-2xl flex items-center px-4 border border-zinc-800 focus-within:border-cyan-500/50">
            <input 
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.type_message}
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
            <button className="p-2 text-zinc-500 hover:text-white"><Smile size={20} /></button>
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!newMessageText.trim()}
            className="p-3 bg-cyan-500 text-black rounded-full disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-cyan-500/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">{t.messages}</h2>
        <button className="p-2 bg-zinc-900 rounded-full text-cyan-400"><Send size={20} /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          placeholder="Search chats..."
          className="w-full bg-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none border border-zinc-800 focus:border-zinc-700 transition-all"
        />
      </div>

      <div className="space-y-1">
        {conversations.length > 0 ? conversations.map(c => (
          <button 
            key={c.userId}
            onClick={() => setActiveChat(c.userId)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-900/50 transition-all active:scale-95 group"
          >
            <div className="relative">
              <img src={c.userAvatar} className="w-14 h-14 rounded-full border border-zinc-700 group-hover:border-cyan-500/50 transition-all" alt="" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-sm">{c.username}</h4>
                <span className="text-[10px] text-zinc-500">2h ago</span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-1">{c.lastMessage || 'Sent a media file'}</p>
            </div>
          </button>
        )) : (
          <div className="py-20 text-center text-zinc-600">
             <MessageCircle className="mx-auto mb-4 opacity-20" size={48} />
             <p>No conversations yet. Start chatting with friends!</p>
          </div>
        )}
      </div>
    </div>
  );
};
