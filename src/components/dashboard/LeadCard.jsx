import React from 'react';
import { MapPin, IndianRupee, Clock, CalendarCheck, ChevronRight, Zap } from 'lucide-react';

export default function LeadCard({ lead, onSelect }) {
  const getBadgeStyle = (label) => {
    switch (label) {
      case 'HOT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'WARM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'COLD':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
  };

  return (
    <div
      onClick={() => onSelect(lead.id)}
      className="glass-card rounded-xl p-5 cursor-pointer relative group flex flex-col justify-between border hover:border-blue-500/50 transition-all duration-200"
    >
      {/* Top Header: Customer Name & Priority Score Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
              {lead.name}
              {lead.calendar?.scheduled && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full" title="Google Calendar Event Scheduled">
                  <CalendarCheck className="h-3 w-3" /> Scheduled
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span>{lead.location}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className={`px-2.5 py-1 rounded-full text-xs font-black border ${getScoreColor(lead.priority_score)} flex items-center gap-1 shadow-sm`}>
              <span>{Math.round(lead.priority_score)}</span>
              <span className="text-[10px] font-semibold opacity-75">/ 100</span>
            </div>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getBadgeStyle(lead.priority_label)}`}>
              {lead.priority_label}
            </span>
          </div>
        </div>

        {/* Requirements & Budget Grid */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Requirement</span>
            <span className="font-semibold text-slate-200 line-clamp-1">{lead.property_requirement}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Budget & Timeline</span>
            <span className="font-semibold text-slate-200 line-clamp-1">
              {lead.budget} • {lead.buying_timeline}
            </span>
          </div>
        </div>

        {/* Customer Message Excerpt */}
        <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
          "{lead.customer_message}"
        </p>
      </div>

      {/* Footer: AI Recommended Action Preview */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-[11px] line-clamp-1 pr-2">
          <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">{lead.ai_analysis?.recommended_action}</span>
        </div>
        <div className="text-blue-400 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-1 transition-transform flex-shrink-0">
          <span>View</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
