import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const HelpCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Halo! Saya asisten Montana AI. Ada yang bisa saya bantu terkait penggunaan aplikasi atau layanan reklamasi hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'model', text: "Untuk bantuan, silakan hubungi WhatsApp Admin di 081122220044." }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[44px] border border-white/50 dark:border-slate-800 shadow-2xl overflow-hidden relative group transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-100"></div>
      
      {/* Header Widget */}
      <div className="p-8 pb-4 relative z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2">Support Center</h4>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Layanan Pengaduan</p>
          </div>
          <a 
            href="https://wa.me/6281122220044" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <i className="fab fa-whatsapp text-sm"></i>
            <span>Hubungi Admin</span>
          </a>
        </div>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Asisten AI Aktif 24/7 • Respons Real-time</p>
      </div>

      {/* Chat History Area */}
      <div 
        ref={scrollRef}
        className="h-[320px] overflow-y-auto p-8 space-y-6 no-scrollbar relative z-10 bg-slate-50/30 dark:bg-slate-950/20"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-medium leading-relaxed shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 relative z-10">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Montana AI Intelligence Engine v4.0</p>
        </div>
      </div>
    </div>
  );
};