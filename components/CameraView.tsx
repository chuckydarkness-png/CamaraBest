
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Circle, Square, Image as ImageIcon } from 'lucide-react';

interface CameraViewProps {
  onCapture: (blob: Blob, type: 'image' | 'video') => void;
  onClose: () => void;
  t: any;
}

const FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'Noir', class: 'grayscale brightness-75 contrast-125' },
  { name: 'Retro', class: 'sepia brightness-90 saturate-150' },
  { name: 'Vivid', class: 'saturate-200 contrast-110' },
  { name: 'Cool', class: 'hue-rotate-180 brightness-110' },
  { name: 'Dreamy', class: 'blur-[1px] brightness-110 saturate-125' },
];

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.filter = getComputedStyle(videoRef.current).filter;
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => blob && onCapture(blob, 'image'), 'image/jpeg');
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      onCapture(blob, 'video');
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="relative flex-1 bg-zinc-900 flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.class}`}
        />
        
        {/* Top Controls */}
        <div className="absolute top-6 inset-x-0 px-6 flex justify-between items-center z-10">
          <button onClick={onClose} className="p-2 bg-black/40 backdrop-blur rounded-full text-white">
            <Square size={20} fill="white" />
          </button>
          <button 
            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
            className="p-2 bg-black/40 backdrop-blur rounded-full text-white"
          >
            <RefreshCw size={24} />
          </button>
        </div>

        {/* Filters Carousel */}
        <div className="absolute bottom-32 inset-x-0 flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar scroll-smooth">
          {FILTERS.map(f => (
            <button 
              key={f.name}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 ${activeFilter.name === f.name ? 'scale-110' : 'opacity-60'}`}
            >
              <div className={`w-14 h-14 rounded-full border-2 ${activeFilter.name === f.name ? 'border-cyan-400' : 'border-white/20'} bg-zinc-800 overflow-hidden`}>
                <div className={`w-full h-full bg-gradient-to-tr from-pink-500 to-cyan-500 ${f.class}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{f.name}</span>
            </button>
          ))}
        </div>

        {/* Main Controls */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center items-center gap-12">
          <button className="text-white opacity-40"><ImageIcon size={28} /></button>
          
          {/* Fix: Removed non-standard onLongPress attribute */}
          <button 
            onClick={isRecording ? stopRecording : takePhoto}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 animate-pulse' : 'border-white'}`}
          >
            <div className={`rounded-full transition-all ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-white'}`} />
          </button>

          <button 
             onClick={isRecording ? undefined : startRecording}
             className={`text-white ${isRecording ? 'opacity-20' : ''}`}
          >
            <Circle size={28} className={isRecording ? 'text-red-500 fill-red-500' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};
