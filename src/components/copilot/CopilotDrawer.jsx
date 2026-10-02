import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, ShieldAlert, CornerDownRight } from 'lucide-react';
import { askCopilot } from '../../services/api';

export default function CopilotDrawer({ lead }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Suggested quick prompts per requirement 6
  const quickPrompts = [
    "What should I emphasize on the call?",
    "What are the customer's biggest concerns?",
    "Make my reply more assertive.",
    "Would this customer consider a slightly higher budget?",
    "What key questions should I ask next?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || !lead || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await askCopilot(lead.id, textToSend, updatedHistory);
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Sorry, I ran into an issue retrieving copilot insights.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Sales Copilot</h3>
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                Grounded AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contextualized for {lead.name}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Welcome Banner */}
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-200">
          <div className="flex items-center gap-2 font-bold mb-1 text-blue-300">
            <Sparkles className="h-4 w-4" />
            <span>AI Sales Assistant Ready</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Ask any question regarding <strong>{lead.name}</strong>'s inquiry, budget, objections, or negotiation strategy. All responses are strictly grounded in lead data.
          </p>
        </div>

        {/* Chat History */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 italic text-xs">
              Analyzing lead context...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 px-4 border-t border-slate-800/60 bg-slate-900/40">
        <span className="text-[10px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
          <CornerDownRight className="h-3 w-3" /> Suggested Questions:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSend(promptText)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] text-slate-300 whitespace-nowrap transition-colors flex-shrink-0 hover:text-white"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${lead.name}...`}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-purple-600/30 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
