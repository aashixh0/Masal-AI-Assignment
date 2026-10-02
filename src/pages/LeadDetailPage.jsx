import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Sun,
  Snowflake,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { fetchLeadById } from '../services/api';
import { useLeads } from '../context/LeadContext';
import ScheduleCalendarModal from '../components/modals/ScheduleCalendarModal';
import CopilotDrawer from '../components/copilot/CopilotDrawer';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allLeads } = useLeads();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    // Check state first, or fetch from API
    const existing = allLeads.find((l) => l.id === id);
    if (existing) {
      setLead(existing);
      setLoading(false);
    } else {
      fetchLeadById(id)
        .then((data) => setLead(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, allLeads]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading lead intelligence...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Lead Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested lead ID does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleCopyResponse = () => {
    if (lead.ai_analysis?.suggested_response) {
      navigator.clipboard.writeText(lead.ai_analysis.suggested_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreBadge = (label, score) => {
    let icon = Flame;
    let bg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    if (label === 'WARM') {
      icon = Sun;
      bg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    } else if (label === 'COLD') {
      icon = Snowflake;
      bg = 'bg-sky-500/10 border-sky-500/30 text-sky-400';
    }
    const Icon = icon;

    return (
      <div className={`px-4 py-2 rounded-xl border ${bg} flex items-center gap-3 shadow-lg`}>
        <Icon className="h-6 w-6" />
        <div>
          <div className="text-xl font-extrabold flex items-baseline gap-1">
            <span>{Math.round(score)}</span>
            <span className="text-xs font-semibold opacity-75">/ 100</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">{label} PRIORITY</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">{lead.name}</h1>
              {lead.calendar?.scheduled && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Event Scheduled
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" /> {lead.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-400" /> {lead.budget}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-blue-400" /> {lead.buying_timeline}
              </span>
            </div>
          </div>
        </div>

        {/* Priority Badge & Calendar Action */}
        <div className="flex items-center gap-3">
          {getScoreBadge(lead.priority_label, lead.priority_score)}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Calendar className="h-4 w-4" />
            <span>{lead.calendar?.scheduled ? 'Reschedule Follow-up' : 'Schedule Follow-up'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Lead Cards) & Right Column (AI Copilot Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intelligence Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Breakdown & Reasons */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Score Breakdown & Priority Reasons
            </h3>
            
            {/* Sub-scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Intent (35%)</span>
                <span className="text-lg font-bold text-rose-400">{lead.ai_analysis?.intent_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Timeline (30%)</span>
                <span className="text-lg font-bold text-amber-400">{lead.ai_analysis?.timeline_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Requirements (20%)</span>
                <span className="text-lg font-bold text-blue-400">{lead.ai_analysis?.requirement_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Budget (15%)</span>
                <span className="text-lg font-bold text-emerald-400">{lead.ai_analysis?.budget_clarity_score}/100</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {lead.priority_reasons?.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Action Card */}
          <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-900/80">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" /> Next Best Action
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {lead.ai_analysis?.recommended_action}
            </p>
          </div>

          {/* AI Executive Summary & Intent */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">AI Executive Summary</h3>
              <p className="text-xs text-slate-200 leading-relaxed">{lead.ai_analysis?.summary}</p>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Customer Intent Profile</h3>
              <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs">
                {lead.ai_analysis?.intent}
              </span>
            </div>
          </div>

          {/* Requirements & Objections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-400" /> Key Requirements
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {lead.ai_analysis?.key_requirements?.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" /> Objections & Concerns
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {lead.ai_analysis?.objections?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Customer Response */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-400" /> Suggested Customer Response
              </h3>
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Reply'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
              "{lead.ai_analysis?.suggested_response}"
            </div>
          </div>

          {/* Original Customer Message */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Original Inquiry / Message</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{lead.customer_message}</p>
          </div>
        </div>

        {/* Right Column: Grounded AI Copilot Drawer */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <CopilotDrawer lead={lead} />
          </div>
        </div>
      </div>

      {/* Schedule Calendar Modal */}
      <ScheduleCalendarModal
        lead={lead}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
