import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { scheduleCalendarFollowup } from '../../services/api';
import { useLeads } from '../../context/LeadContext';

export default function ScheduleCalendarModal({ lead, isOpen, onClose }) {
  const { updateLeadInState, calendarConnected } = useLeads();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Default to tomorrow's date
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [scheduleData, setScheduleData] = useState({
    date: tomorrowStr,
    time: '10:00',
    duration_minutes: 30,
    include_talking_points: true,
    include_suggested_response: true,
    custom_notes: '',
  });

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    try {
      setLoading(true);
      const updatedLead = await scheduleCalendarFollowup(lead.id, scheduleData);
      updateLeadInState(updatedLead);
      setSuccessResult({
        eventUrl: updatedLead.calendar?.event_url,
        message: 'Google Calendar Follow-up Event scheduled successfully!',
      });
    } catch (err) {
      setError(err.message || 'Failed to schedule calendar follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schedule Calendar Follow-up</h2>
              <p className="text-xs text-slate-400">Sync with Google Calendar for {lead.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status / Notice */}
        {!calendarConnected && (
          <div className="my-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <span>
              Google OAuth is not connected yet. Events will be prepared and simulated with Google Calendar direct links.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="my-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Success */}
        {successResult ? (
          <div className="my-4 text-center py-4 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Event Scheduled!</h3>
              <p className="text-xs text-slate-400 mt-1">{successResult.message}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={successResult.eventUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/30"
              >
                <span>Open in Google Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Schedule Form */
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
              <select
                value={scheduleData.duration_minutes}
                onChange={(e) => setScheduleData({ ...scheduleData, duration_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            {/* Content Checkboxes */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="block text-slate-400 font-semibold text-[11px] mb-1">Include in Calendar Description:</span>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleData.include_talking_points}
                  onChange={(e) => setScheduleData({ ...scheduleData, include_talking_points: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Include Call Talking Points</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleData.include_suggested_response}
                  onChange={(e) => setScheduleData({ ...scheduleData, include_suggested_response: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Include AI Suggested Customer Response</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Notes for Call (Optional)</label>
              <textarea
                rows={2}
                value={scheduleData.custom_notes}
                onChange={(e) => setScheduleData({ ...scheduleData, custom_notes: e.target.value })}
                placeholder="e.g., Remind customer to bring identity proof for site visit..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-emerald-600/30"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>Create Google Calendar Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
