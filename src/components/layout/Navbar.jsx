import React from 'react';
import { Sparkles, Plus, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';

export default function Navbar() {
  const { setIsModalOpen, calendarConnected } = useLeads();
  const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://leadpilot-backend-nsik.onrender.com/api');

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20">
          <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              LeadPilot
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              AI Sales Copilot
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Real Estate Lead Prioritization</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Google Calendar Auth Indicator / Button */}
        <a
          href={`${apiBase}/auth/google`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            calendarConnected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4 text-blue-400" />
          <span>{calendarConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'}</span>
          {calendarConnected ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-1" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 ml-1" />
          )}
        </a>

        {/* Add Lead Modal Trigger Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Lead</span>
        </button>
      </div>
    </header>
  );
}
