import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LeadProvider } from './context/LeadContext';
import Navbar from './components/layout/Navbar';
import DashboardPage from './pages/DashboardPage';
import LeadDetailPage from './pages/LeadDetailPage';

export default function App() {
  return (
    <LeadProvider>
      <Router>
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leads/:id" element={<LeadDetailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LeadProvider>
  );
}
