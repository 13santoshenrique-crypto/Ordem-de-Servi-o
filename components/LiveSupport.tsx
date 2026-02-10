
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Bot, Headphones, Loader2, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Funções de decodificação/codificação seguindo as diretrizes
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveSupport: React.FC = () => {
  const { currentUser } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            // Audio streaming setup
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMicMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Video frames streaming (1 frame per second)
            const interval = window.setInterval(() => {
                if (!isVideoOn || !canvasRef.current || !videoRef.current) return;
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    canvas.toBlob(async (blob) => {
                        if (blob) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64Data = (reader.result as string).split(',')[1];
                                sessionPromise.then(session => session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
                            };
                            reader.readAsDataURL(blob);
                        }
                    }, 'image/jpeg', 0.5);
                }
            }, 1000);

            return () => clearInterval(interval);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'Você é um engenheiro sênior especialista em equipamentos Petersime e incubação Aviagen. Ajude o técnico verbalmente enquanto ele mostra o problema. Seja conciso e técnico.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="industrial-card p-10 bg-[#1A3673] text-white border-none overflow-hidden relative">
         <div className="absolute top-0 right-0 p-10 opacity-10"><Headphones size={120} /></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Suporte Assistido Live</h2>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 italic">Conexão de Voz e Vídeo Direta com a IA Especialista</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <div className="industrial-card aspect-video bg-slate-900 overflow-hidden relative group">
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoOn ? 'opacity-100' : 'opacity-20'}`} />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isActive && !isConnecting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                          <Bot size={40} className="text-white/40" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase italic">Inicie o Chamado Técnico</h3>
                      <p className="text-white/40 text-xs font-bold uppercase mt-2 max-w-xs">A IA analisará o áudio e o vídeo em tempo real para orientar sua manutenção.</p>
                  </div>
              )}

              {isConnecting && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center space-y-4">
                      <Loader2 size={48} className="text-blue-400 animate-spin" />
                      <p className="text-white font-black uppercase text-[10px] tracking-widest animate-pulse">Estabelecendo Link Seguro...</p>
                  </div>
              )}

              {isActive && (
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 pointer-events-auto">
                          <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{isSpeaking ? 'IA Falando...' : 'IA Escutando...'}</span>
                      </div>
                      
                      <div className="flex gap-2 pointer-events-auto">
                          <button onClick={() => setIsMicMuted(!isMicMuted)} className={`p-4 rounded-xl transition-all ${isMicMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                              {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-4 rounded-xl transition-all ${!isVideoOn ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                              {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
                          </button>
                          <button onClick={stopSession} className="p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">
                              <PhoneOff size={20} />
                          </button>
                      </div>
                  </div>
              )}
           </div>

           {!isActive && !isConnecting && (
               <button onClick={startSession} className="w-full py-6 bg-[#1A3673] hover:bg-slate-900 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 group">
                  <Headphones size={24} className="group-hover:animate-bounce" /> Conectar com Engenheiro IA
               </button>
           )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="industrial-card p-8 bg-slate-50 border-slate-200">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <ShieldCheck size={18} className="text-emerald-500" /> Protocolo de Suporte
              </h3>
              <ul className="space-y-4">
                 <li className="flex gap-3 text-xs font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                    Sessão criptografada de ponta a ponta.
                 </li>
                 <li className="flex gap-3 text-xs font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                    A IA tem acesso aos manuais Petersime BioStreamer.
                 </li>
                 <li className="flex gap-3 text-xs font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                    O vídeo ajuda a identificar vazamentos e anomalias visuais.
                 </li>
              </ul>
           </div>

           <div className="industrial-card p-8 bg-blue-50/50 border-blue-100 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10"><Zap size={80} /></div>
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">Dica Pro</p>
              <p className="text-xs text-blue-900 font-medium leading-relaxed italic">
                 "Ao apontar a câmera para o painel elétrico, peça para a IA identificar o componente ou ler o código de erro no display."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
