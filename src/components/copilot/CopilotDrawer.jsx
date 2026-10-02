import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, ShieldAlert, CornerDownRight, Copy, Check } from 'lucide-react';
import { askCopilot } from '../../services/api';

const renderInlineFormatting = (text) => {
  if (!text) return null;

  // Split text by **bold** markers
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const content = part.slice(2, -2);

      // 1. Currency / Budget values (e.g., Rs. 1.8 Cr, ₹1.8 Cr, $150k)
      if (/(?:Rs\.?|₹|\$|USD|INR|\bCr\b|\bLakh\b)/i.test(content)) {
        return (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-md font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] shadow-sm"
          >
            {content}
          </span>
        );
      }

      // 2. Score metrics (e.g., 95/100, Score: 80/100)
      if (/\b\d{1,3}\s*\/\s*100\b/.test(content)) {
        return (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-md font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] shadow-sm"
          >
            {content}
          </span>
        );
      }

      // 3. Priority & Urgency status badges (e.g., HOT, WARM, COLD, URGENT)
      if (/\b(HOT|WARM|COLD|URGENT|READY-TO-MOVE|HIGH|MEDIUM|LOW)\b/i.test(content)) {
        let badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        const upper = content.toUpperCase();
        if (upper.includes('HOT') || upper.includes('URGENT') || upper.includes('HIGH')) {
          badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        } else if (upper.includes('WARM') || upper.includes('MEDIUM')) {
          badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        } else if (upper.includes('COLD') || upper.includes('LOW')) {
          badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
        }
        return (
          <span
            key={i}
            className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md font-extrabold border text-[10px] tracking-wider uppercase ${badgeStyle}`}
          >
            {content}
          </span>
        );
      }

      // Standard bold text
      return (
        <strong key={i} className="font-bold text-white">
          {content}
        </strong>
      );
    }

    return part;
  });
};

function CopilotMessageFormatter({ text }) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const handleCopy = () => {
    const plainText = text.replace(/\*\*/g, '').replace(/^#+\s*/gm, '');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawBlocks = text.split(/\n\n+/);

  return (
    <div className="space-y-3 text-xs text-slate-200 leading-relaxed relative">
      {rawBlocks.map((block, bIdx) => {
        const lines = block.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length === 0) return null;

        const firstLine = lines[0].trim();

        // 1. Is Section Header (e.g. **Header:** or ### Header)
        const isHeaderOnly =
          lines.length === 1 &&
          ((firstLine.startsWith('**') && firstLine.endsWith('**')) ||
            firstLine.startsWith('#') ||
            (firstLine.startsWith('**') && firstLine.includes(':**')));

        if (isHeaderOnly) {
          const headerText = firstLine.replace(/^[\*#\s]+|[\*#\s]+$/g, '');
          return (
            <div
              key={bIdx}
              className="flex items-center gap-1.5 font-bold text-purple-300 text-[12.5px] pt-1 pb-1 border-b border-purple-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
              <span>{headerText}</span>
            </div>
          );
        }

        // 2. Check if pure list
        const isPureList = lines.every((l) => {
          const t = l.trim();
          return t.startsWith('- ') || t.startsWith('* ') || /^\d+\.\s/.test(t);
        });

        if (isPureList) {
          return (
            <div key={bIdx} className="space-y-1.5 my-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[-*\d.]+\s*/, '');
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 p-2 px-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 leading-relaxed text-slate-200">
                      {renderInlineFormatting(cleanLine)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // 3. Mixed block
        return (
          <div key={bIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (
                (trimmed.startsWith('**') && trimmed.endsWith(':**')) ||
                (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)
              ) {
                const headerText = trimmed.replace(/^[\*#\s]+|[\*#\s]+$/g, '');
                return (
                  <div
                    key={lIdx}
                    className="flex items-center gap-1.5 font-bold text-purple-300 text-[12px] pt-1 border-b border-slate-800 pb-1"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                    <span>{headerText}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
                const cleanLine = trimmed.replace(/^[-*\d.]+\s*/, '');
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 p-2 px-2.5 rounded-lg transition-colors shadow-sm my-1"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 leading-relaxed text-slate-200">
                      {renderInlineFormatting(cleanLine)}
                    </div>
                  </div>
                );
              }

              if (
                trimmed.startsWith('"') ||
                trimmed.startsWith('“') ||
                trimmed.startsWith('Per customer') ||
                trimmed.startsWith('Context from message:')
              ) {
                return (
                  <div
                    key={lIdx}
                    className="border-l-2 border-purple-500 bg-purple-950/20 p-2 px-2.5 rounded-r-lg text-purple-200 text-[11.5px] italic my-1 shadow-inner"
                  >
                    {renderInlineFormatting(trimmed)}
                  </div>
                );
              }

              return (
                <p key={lIdx} className="text-slate-300 leading-relaxed">
                  {renderInlineFormatting(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}

      <div className="flex justify-end pt-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-300 transition-colors opacity-80 hover:opacity-100 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40"
          title="Copy formatted answer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

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
              className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md whitespace-pre-wrap'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              {msg.sender === 'user' ? (
                msg.text
              ) : (
                <CopilotMessageFormatter text={msg.text} />
              )}
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

