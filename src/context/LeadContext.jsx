import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLeads, createLead as createLeadApi, checkCalendarStatus } from '../services/api';

const LeadContext = createContext();

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLeads();
      setLeads(data);
      const calStatus = await checkCalendarStatus();
      setCalendarConnected(calStatus.connected);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load leads from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check URL query param for OAuth redirect status
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar_connected') === 'true') {
      setCalendarConnected(true);
    }
  }, []);

  const handleCreateLead = async (leadInput) => {
    try {
      setLoading(true);
      const newLead = await createLeadApi(leadInput);
      setLeads((prev) => [newLead, ...prev]);
      setIsModalOpen(false);
      return newLead;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLeadInState = (updatedLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  // Filtered & Searched Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = activeFilter === 'ALL' || lead.priority_label === activeFilter;
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property_requirement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Badge Statistics
  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.priority_label === 'HOT').length,
    warm: leads.filter((l) => l.priority_label === 'WARM').length,
    cold: leads.filter((l) => l.priority_label === 'COLD').length,
  };

  return (
    <LeadContext.Provider
      value={{
        leads: filteredLeads,
        allLeads: leads,
        loading,
        error,
        stats,
        activeFilter,
        setActiveFilter,
        searchTerm,
        setSearchTerm,
        selectedLeadId,
        setSelectedLeadId,
        isModalOpen,
        setIsModalOpen,
        calendarConnected,
        setCalendarConnected,
        refreshLeads: loadData,
        createLead: handleCreateLead,
        updateLeadInState,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
