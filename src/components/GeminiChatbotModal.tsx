import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  MapPin,
  ExternalLink,
  Zap,
  Wrench,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Copy,
  Check,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  places?: Array<{
    title: string;
    uri: string;
    address?: string;
    rating?: number;
  }>;
  modelUsed?: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lng: number; address: string };
  initialPrompt?: string;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  userLocation = { lat: -23.5617, lng: -46.6865, address: 'Pinheiros, São Paulo' },
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Olá! Sou o **Assistente Inteligente ProServiços** movido a IA Gemini.

Posso te ajudar com:
- 🛠️ **Diagnóstico técnico** de problemas residenciais (elétrica, hidráulica, pintura, marcenaria).
- 📍 **Buscar materiais e lojas próximas** integradas com dados reais do Google Maps.
- 💰 **Estimativas de preços médios** e normas técnicas (como NBR 5410).
- 🎙️ **Comandos de voz**: toque no microfone para falar o que precisa!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-2.5-flash'
    }
  ]);

  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [roleType, setRoleType] = useState<'specialist' | 'fast' | 'maps_advisor' | 'inspector'>('specialist');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Audio Recording with Microphone and Gemini Transcription (gemini-2.5-transcribe)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' })
        });
        const data = await res.json();
        if (data.success && data.text) {
          setInputText((prev) => (prev ? `${prev} ${data.text}` : data.text));
        }
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if user is asking for nearby stores or places (Maps Grounding)
      const isMapsQuery =
        roleType === 'maps_advisor' ||
        text.toLowerCase().includes('loja') ||
        text.toLowerCase().includes('material') ||
        text.toLowerCase().includes('onde comprar') ||
        text.toLowerCase().includes('perto') ||
        text.toLowerCase().includes('próximo') ||
        text.toLowerCase().includes('leroy') ||
        text.toLowerCase().includes('telhanorte');

      if (isMapsQuery) {
        // Trigger Google Maps Grounding via gemini-2.5-flash
        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text,
            latitude: userLocation.lat,
            longitude: userLocation.lng
          })
        });

        const data = await res.json();
        if (data.success) {
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'model',
            content: data.text,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            places: data.places || [],
            modelUsed: 'gemini-2.5-flash (Maps Grounding)'
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsLoading(false);
          return;
        }
      }

      // Standard Multi-turn Gemini Chat endpoint
      const formattedHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          modelChoice,
          roleType
        })
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Erro ao processar resposta');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Não foi possível obter resposta no momento (${err.message || 'Verifique sua conexão'}). Tente novamente em instantes.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelChoice
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: 'Conversa reiniciada. Em que posso te ajudar hoje?',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelChoice
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-2xl h-[90vh] max-h-[720px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Title and Mode Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Assistente Gemini IA</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Consultoria técnica e dados com Google Maps</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="Limpar conversa"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Model and Persona Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/50 border-b border-slate-800/60 text-xs">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                setRoleType('specialist');
                setModelChoice('gemini-2.5-flash');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                roleType === 'specialist'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Técnico Especialista
            </button>

            <button
              onClick={() => {
                setRoleType('maps_advisor');
                setModelChoice('gemini-2.5-flash');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                roleType === 'maps_advisor'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Lojas & Maps
            </button>

            <button
              onClick={() => {
                setRoleType('fast');
                setModelChoice('gemini-2.5-flash-lite');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                roleType === 'fast'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Rápido
            </button>

            <button
              onClick={() => {
                setRoleType('inspector');
                setModelChoice('gemini-2.5-pro');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                roleType === 'inspector'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Perito Pro
            </button>
          </div>

          {/* Model indicator */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{modelChoice}</span>
          </div>
        </div>

        {/* Message Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}

                  {/* Render Google Maps Places Cards if present (Maps Grounding requirement) */}
                  {msg.places && msg.places.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                        <MapPin className="w-3.5 h-3.5" />
                        Locais encontrados no Google Maps:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.places.map((place, idx) => (
                          <a
                            key={idx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-900 border border-blue-500/30 hover:border-blue-400/60 rounded-xl transition-all group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 truncate">
                                {place.title}
                              </p>
                              {place.address && (
                                <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                              )}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <>
                      <span>•</span>
                      <span>{msg.modelUsed}</span>
                    </>
                  )}
                  {msg.role === 'model' && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="ml-auto flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-none text-xs text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Processando com {modelChoice}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recording / Transcribing Alert Banner */}
        {isRecording && (
          <div className="flex items-center justify-between px-4 py-2 bg-rose-950/80 border-t border-rose-800/80 text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Gravando áudio com seu microfone... Fale agora.</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-2.5 py-1 font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
            >
              Concluir & Transcrever
            </button>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/80 border-t border-amber-800/80 text-amber-200 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Transcrevendo áudio via <strong>gemini-2.5-transcribe</strong>...</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Audio Recording Button with Gemini Transcribe */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Parar gravação' : 'Falar via microfone (Transcrição Gemini)'}
              className={`p-3 rounded-2xl transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua dúvida ou use o microfone..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 rounded-2xl font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Prompt chips suggestions */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
            <span className="text-slate-500 shrink-0">Sugestões:</span>
            <button
              onClick={() => handleSendMessage('Qual o disjuntor adequado para um chuveiro de 7500W?')}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700/60"
            >
              ⚡ Disjuntor p/ chuveiro 7500W
            </button>
            <button
              onClick={() => handleSendMessage('Quais lojas de materiais elétricos estão abertas mais perto de mim?')}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700/60"
            >
              📍 Lojas elétricas no Google Maps
            </button>
            <button
              onClick={() => handleSendMessage('Como consertar vazamento no sifão da pia da cozinha?')}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700/60"
            >
              🚰 Vazamento em sifão de pia
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
