import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-300 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Last Updated: October 2, 2026</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-xs leading-relaxed">
        <section className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="h-4 w-4 text-purple-400" />
            <h2>1. Overview & Information We Collect</h2>
          </div>
          <p>
            LeadPilot ("we", "our", or "us") respects your privacy. This application integrates with Google OAuth services to facilitate seamless follow-up event creation on Google Calendar for real estate sales qualification.
          </p>
          <p>
            When you authenticate via Google, we access basic account information (such as your email address and profile identity) solely to verify your authorized session.
          </p>
        </section>

        <section className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="h-4 w-4 text-blue-400" />
            <h2>2. Google Calendar Integration & Data Usage</h2>
          </div>
          <p>
            LeadPilot requests permission to access Google Calendar APIs strictly to schedule and pre-fill follow-up appointments requested directly by you.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>We do <strong>not</strong> read, scan, store, or sell your private calendar events.</li>
            <li>We use authorization tokens exclusively to perform actions explicitly initiated by the user.</li>
            <li>Google user data is never shared with third parties or used for advertising purposes.</li>
          </ul>
        </section>

        <section className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <h2>3. Security & Data Protection</h2>
          </div>
          <p>
            We implement industry-standard encryption protocols (HTTPS/TLS) to safeguard token exchanges and communication between your browser and our secure backend servers. Access tokens are kept in secure, ephemeral server memory.
          </p>
        </section>

        <section className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white">4. Contact & Support</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please reach out to the project administrator or repository owner on GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
