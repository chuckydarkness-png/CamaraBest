
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Studio } from './pages/Studio';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Explore } from './pages/Explore';
import { ShieldAlert, Key } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const has = await window.aistudio.hasSelectedApiKey();
      setHasKey(has);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true); 
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-effect rounded-[2.5rem] p-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/20">
              <ShieldAlert size={48} color="white" />
           </div>
           <div className="space-y-3">
              <h1 className="text-3xl font-black gradient-text">CameraBest</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Unlock high-quality AI video and image generation by selecting your Gemini API key.
              </p>
           </div>
           <button 
             onClick={handleOpenKey}
             className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl"
           >
             <Key size={20} /> Select API Key
           </button>
           <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
             Requires a paid Google AI Studio project for Veo Video
           </p>
           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             rel="noopener noreferrer"
             className="block text-xs text-cyan-500 underline"
           >
             Learn about billing
           </a>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Studio />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
