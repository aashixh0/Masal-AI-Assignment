import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';

export default function LeadFilters() {
  const { searchTerm, setSearchTerm, activeFilter, setActiveFilter } = useLeads();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, location, requirement..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
        {['ALL', 'HOT', 'WARM', 'COLD'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === filter
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
