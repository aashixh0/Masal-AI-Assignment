const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchLeads() {
  const res = await fetch(`${API_BASE}/leads`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadById(id) {
  const res = await fetch(`${API_BASE}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead details');
  return res.json();
}

export async function createLead(leadData) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create lead');
  }
  return res.json();
}

export async function askCopilot(leadId, question, history = []) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });
  if (!res.ok) throw new Error('Failed to ask Copilot');
  return res.json();
}

export async function checkCalendarStatus() {
  const res = await fetch(`${API_BASE}/calendar/status`);
  if (!res.ok) return { connected: false };
  return res.json();
}

export async function scheduleCalendarFollowup(leadId, scheduleData) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error('Failed to schedule calendar follow-up');
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) return { status: 'unreachable' };
  return res.json();
}
