import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardHome from './DashboardHome';
import TenantSetup from './TenantSetup';
import BookingsView from './BookingsView';
import CalendarView from './CalendarView';
import ClientsView from './ClientsView';
import BarbersView from './BarbersView';
import ServicesView from './ServicesView';
import SettingsView from './SettingsView';
import IntegrationsView from './IntegrationsView';

const Dashboard = () => {
  const { currentTenant, loading } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no tenant, show friendly message for non-admin users
  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded-lg p-8 text-center max-w-md shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tenant found</h3>
          <p className="text-gray-600 mb-4">Please contact your platform administrator to be invited.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/bookings" element={<BookingsView />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/clients" element={<ClientsView />} />
        <Route path="/barbers" element={<BarbersView />} />
        <Route path="/services" element={<ServicesView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/integrations" element={<IntegrationsView />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;