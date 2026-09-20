import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const SUGGESTED_QUESTIONS = [
  "Which stations are crowded?",
  "Are there any train delays?",
  "What's the system status?",
  "Show me peak hour info",
  "Any active alerts?",
  "Give me recommendations",
];

const formatMessage = (text) => {
  // Bold (**text**)
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const AIChatbot = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! I'm **MetroAI** 🚇 — your intelligent metro operations assistant.\n\nI can answer questions about crowd levels, train status, alerts, schedules, and more. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat/message', {
        message: userText
      });
    
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
    
      setMessages(prev => [...prev, botMsg]);
    
      if (!isOpen) setHasUnread(true);
    
    } catch (err) {
      console.error('MetroAI chat error:', err);
    
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: "⚠️ I'm having trouble connecting to the server. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const glassStyle = isDark
    ? { background: 'rgba(10, 10, 25, 0.95)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(20px)' }
    : { background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(20px)' };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:scale-110 hover:shadow-violet-500/60 transition-all duration-300 group"
          title="Open MetroAI Assistant"
        >
          <Bot size={24} className="group-hover:scale-110 transition-transform" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20 transition-all duration-300"
          style={{
            ...glassStyle,
            height: isMinimized ? 'auto' : '580px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">MetroAI Assistant</span>
                  <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/70">Online — AI Powered</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center shrink-0 mt-1 mr-2">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                        : isDark
                          ? 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/10'
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'
                    }`}>
                      <div
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                        className="whitespace-pre-line"
                      />
                      <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60 text-right' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center shrink-0 mt-1 mr-2">
                      <Bot size={14} />
                    </div>
                    <div className={`rounded-2xl rounded-tl-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 shrink-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Quick Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all hover:scale-105 ${
                          isDark
                            ? 'border-violet-500/30 text-violet-300 hover:bg-violet-500/20 bg-violet-500/10'
                            : 'border-violet-300 text-violet-700 hover:bg-violet-50 bg-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className={`p-3 shrink-0 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about crowd, trains, alerts..."
                    className={`flex-1 bg-transparent text-[13px] outline-none placeholder-slate-400 ${isDark ? 'text-white' : 'text-slate-800'}`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 hover:scale-110 transition-all shrink-0"
                  >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  </button>
                </div>
                <p className={`text-[10px] text-center mt-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  MetroAI uses live system data to answer your questions
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatbot;