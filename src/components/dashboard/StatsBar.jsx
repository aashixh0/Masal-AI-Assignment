import React from 'react';
import { Users, Flame, Sun, Snowflake } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';

export default function StatsBar() {
  const { stats, activeFilter, setActiveFilter } = useLeads();

  const filterCards = [
    {
      id: 'ALL',
      label: 'Total Leads',
      count: stats.total,
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'HOT',
      label: 'Hot Leads',
      count: stats.hot,
      icon: Flame,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      activeRing: 'ring-2 ring-rose-500',
    },
    {
      id: 'WARM',
      label: 'Warm Leads',
      count: stats.warm,
      icon: Sun,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'COLD',
      label: 'Cold Leads',
      count: stats.cold,
      icon: Snowflake,
      color: 'from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
      activeRing: 'ring-2 ring-sky-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {filterCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => setActiveFilter(card.id)}
            className={`p-4 rounded-xl text-left border transition-all glass-card relative overflow-hidden group ${
              isActive ? `${card.activeRing} bg-slate-800/80` : 'hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} border`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{card.count}</span>
              <span className="text-[10px] text-slate-400">leads</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
