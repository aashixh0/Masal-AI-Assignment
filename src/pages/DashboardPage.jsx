import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import StatsBar from '../components/dashboard/StatsBar';
import LeadFilters from '../components/dashboard/LeadFilters';
import LeadCard from '../components/dashboard/LeadCard';
import CreateLeadModal from '../components/modals/CreateLeadModal';
import { Plus, Inbox } from 'lucide-react';

export default function DashboardPage() {
  const { filteredLeads, leads, loading, error, setIsModalOpen } = useLeads();
  const navigate = useNavigate();

  const handleSelectLead = (id) => {
    navigate(`/leads/${id}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Lead Prioritization Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-powered semantic qualification & automated action recommendations
          </p>
        </div>
      </div>

      {/* Metric Stats Bar */}
      <StatsBar />

      {/* Filter and Search Bar */}
      <LeadFilters />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && leads.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-xl glass-card border border-slate-800 animate-pulse p-5">
              <div className="h-4 w-1/3 bg-slate-800 rounded mb-4" />
              <div className="h-3 w-1/2 bg-slate-800 rounded mb-2" />
              <div className="h-16 bg-slate-900 rounded my-3" />
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        /* Lead Cards Grid */
        <div>
          {leads.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 max-w-md mx-auto my-8 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mx-auto flex items-center justify-center">
                <Inbox className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Leads Found</h3>
                <p className="text-xs text-slate-400 mt-1">Get started by creating your first inbound lead for AI qualification.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30"
              >
                Create Lead
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onSelect={handleSelectLead} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Lead Modal */}
      <CreateLeadModal />
    </div>
  );
}
