
import React, { useState, useRef, useEffect } from 'react';
import { generateAIImage, generateAIVideo } from '../services/gemini';
import { RealtimeService } from '../services/realtime';
import { translations, Language } from '../services/translations';
import { Wand2, Video, Image as ImageIcon, Sparkles, Send, Loader2, Trash2, Download } from 'lucide-react';

export const Studio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [genType, setGenType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<Language>(RealtimeService.getLanguage());

  useEffect(() => {
    const updateLang = () => setLang(RealtimeService.getLanguage());
    window.addEventListener('lang_updated', updateLang);

    const pending = sessionStorage.getItem('pending_media');
    if (pending) {
      const { data, type } = JSON.parse(pending);
      if (type === 'image') setSourceImage(data);
      sessionStorage.removeItem('pending_media');
    }

    return () => window.removeEventListener('lang_updated', updateLang);
  }, []);

  const t = translations[lang] || translations['en'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsProcessing(true);
    try {
      if (genType === 'image') {
        const url = await generateAIImage(prompt, sourceImage || undefined);
        setResult({ url, type: 'image' });
      } else {
        const url = await generateAIVideo(prompt, sourceImage || undefined);
        setResult({ url, type: 'video' });
      }
    } catch (err) {
      alert("Error generating. Check your API Key and billing status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const user = RealtimeService.getCurrentUser();
    RealtimeService.addPost({
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      mediaUrl: result.url,
      mediaType: result.type,
      caption: prompt
    });
    alert("Posted to community feed!");
    setResult(null);
    setSourceImage(null);
    setPrompt('');
  };

  const handleSave = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `camerabest_${result.type}_${Date.now()}.${result.type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Saved to device!");
  };

  const handleClearSource = () => {
    setSourceImage(null);
    setResult(null);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Preview Area */}
      <div className="relative group">
        <div className={`aspect-[4/5] rounded-[2.5rem] overflow-hidden border-2 border-dashed ${sourceImage || result ? 'border-zinc-800' : 'border-zinc-700 bg-zinc-900/50'} flex items-center justify-center transition-all shadow-2xl`}>
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-cyan-400" size={64} />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500 animate-pulse" size={24} />
              </div>
              <p className="text-zinc-400 font-bold tracking-wider animate-pulse">{t.ai_magic}</p>
            </div>
          ) : result ? (
            result.type === 'image' ? (
              <img src={result.url} className="w-full h-full object-cover" alt="AI Result" />
            ) : (
              <video src={result.url} autoPlay loop muted className="w-full h-full object-cover" />
            )
          ) : sourceImage ? (
            <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
          ) : (
            <div className="text-center px-10 space-y-4">
               <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg">
                  <Wand2 className="text-zinc-600" size={40} />
               </div>
               <p className="text-zinc-500 text-sm font-medium">Ready to start? Use a reference image or just type a prompt!</p>
            </div>
          )}
        </div>
        
        {!isProcessing && (sourceImage || result) && (
          <button 
            onClick={handleClearSource}
            className="absolute top-6 right-6 p-3 bg-red-500/90 backdrop-blur rounded-2xl text-white shadow-xl hover:scale-110 transition-transform active:scale-95 z-20"
          >
            <Trash2 size={20} />
          </button>
        )}

        {!isProcessing && !result && !sourceImage && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-6 right-6 p-4 bg-white text-black rounded-[1.5rem] shadow-2xl hover:scale-110 transition-transform active:scale-95"
          >
            <ImageIcon size={28} />
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Type Selector & Input Area */}
      <div className="space-y-4">
        <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
           <button 
             onClick={() => setGenType('image')}
             className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${genType === 'image' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
           >
             <ImageIcon size={14} className={genType === 'image' ? 'text-pink-500' : ''} /> {t.ai_effect}
           </button>
           <button 
             onClick={() => setGenType('video')}
             className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${genType === 'video' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
           >
             <Video size={14} className={genType === 'video' ? 'text-cyan-500' : ''} /> {t.ai_video}
           </button>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.describe_masterpiece}
            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 outline-none resize-none transition-all placeholder:text-zinc-600"
          />
          <Sparkles className="absolute bottom-4 right-4 text-zinc-700" size={18} />
        </div>

        {result ? (
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={handleShare}
                className="col-span-2 py-5 rounded-3xl bg-gradient-to-r from-pink-600 to-cyan-600 font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-cyan-950/20"
             >
               <Send size={18} /> {t.share_feed}
             </button>
             <button 
                onClick={handleSave}
                className="py-4 rounded-3xl bg-zinc-900 border border-zinc-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all"
             >
               <Download size={16} /> {t.save}
             </button>
             <button 
                onClick={() => setResult(null)}
                className="py-4 rounded-3xl bg-zinc-900 border border-zinc-800 font-bold text-xs text-red-400 flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all"
             >
               <Trash2 size={16} /> {t.discard}
             </button>
          </div>
        ) : (
          <button
            disabled={isProcessing || !prompt}
            onClick={handleGenerate}
            className="w-full py-5 rounded-3xl bg-white text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-2xl shadow-white/5"
          >
            <Sparkles size={20} className="text-cyan-500" />
            {t.generate_masterpiece}
          </button>
        )}
      </div>

      {/* Tip Banner */}
      <div className="p-5 bg-gradient-to-br from-zinc-900/80 to-black rounded-3xl border border-zinc-800/50 space-y-2">
         <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles size={14} className="text-pink-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{t.tips}</h4>
         </div>
         <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{t.tip_desc}</p>
      </div>
    </div>
  );
};
