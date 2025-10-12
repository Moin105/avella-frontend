import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Building, 
  Users, 
  Calendar,
  TrendingUp,
  Search,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Mail,
  Phone,
  MapPin,
  Copy,
  Send
} from 'lucide-react';
import IntegrationHealth from './IntegrationHealth';
import ErrorCenter from './ErrorCenter';
import MetricsDashboard from './MetricsDashboard';
import CopyLibrary from './CopyLibrary';

const MasterAdminDashboard = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBarbershopModal, setShowAddBarbershopModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newBarbershopCredentials, setNewBarbershopCredentials] = useState(null);
  const [addingBarbershop, setAddingBarbershop] = useState(false);
  const [activeView, setActiveView] = useState('tenants'); // tenants, audit, killswitch, integrations, errors, templates, metrics

  const [newBarbershop, setNewBarbershop] = useState({
    businessName: '',
    businessType: 'salon',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    phone: '',
    website: '',
    timezone: 'America/New_York'
  });

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Mock data for master admin view
  const mockTenants = [
    {
      id: '1',
      business_name: 'The Fade Room',
      owner_name: 'Sarah Johnson',
      owner_email: 'sarah.johnson@example.com',
      business_type: 'barbershop',
      created_at: new Date(2025, 8, 15),
      is_active: true,
      stats: {
        active_barbers: 3,
        appointments_this_month: 156,
        connected_calendars: 2,
        recent_activity: 45
      }
    },
    {
      id: '2', 
      business_name: 'Elite Hair Studio',
      owner_name: 'Jane Smith',
      owner_email: 'jane.smith@example.com',
      business_type: 'salon',
      created_at: new Date(2025, 7, 22),
      is_active: true,
      stats: {
        active_barbers: 5,
        appointments_this_month: 203,
        connected_calendars: 4,
        recent_activity: 67
      }
    },
    {
      id: '3',
      business_name: 'Downtown Cuts',
      owner_name: 'Mike Rodriguez',
      owner_email: 'mike@downtowncuts.com',
      business_type: 'barbershop',
      created_at: new Date(2025, 6, 10),
      is_active: false,
      stats: {
        active_barbers: 2,
        appointments_this_month: 23,
        connected_calendars: 0,
        recent_activity: 8
      }
    }
  ];

  const mockSystemStats = {
    total_tenants: 3,
    total_barbers: 10,
    appointments_today: 47,
    connected_calendars: 6,
    recent_signups: 2,
    last_updated: new Date().toISOString()
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setTenants(mockTenants);
        setSystemStats(mockSystemStats);
        return;
      }

      try {
        const [tenantsRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/tenants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/admin/system-overview`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        setTenants(tenantsRes.data);
        setSystemStats(statsRes.data);
      } catch (apiError) {
        console.error('Error loading data from API, using mock data:', apiError);
        // Fallback to mock data if API fails
        setTenants(mockTenants);
        setSystemStats(mockSystemStats);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setTenants(mockTenants);
      setSystemStats(mockSystemStats);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (tenant) => {
    if (!tenant.is_active) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    const healthScore = (tenant.stats.connected_calendars / tenant.stats.active_barbers) * 100;
    
    if (healthScore >= 80) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (healthScore >= 50) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (tenant) => {
    if (!tenant.is_active) return 'Suspended';
    
    const healthScore = (tenant.stats.connected_calendars / tenant.stats.active_barbers) * 100;
    
    if (healthScore >= 80) return 'Healthy';
    if (healthScore >= 50) return 'Needs Attention';
    return 'Critical';
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const businessTypes = [
    { value: 'salon', label: 'Hair Salon' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'spa', label: 'Spa' },
    { value: 'beauty', label: 'Beauty Salon' },
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddBarbershop = async (e) => {
    e.preventDefault();
    setAddingBarbershop(true);

    try {
      // Generate password for the owner
      const password = generatePassword();

      // 1. Create the owner account
      const ownerResponse = await axios.post(`${API_URL}/auth/register`, {
        first_name: newBarbershop.ownerFirstName,
        last_name: newBarbershop.ownerLastName,
        email: newBarbershop.ownerEmail,
        phone: newBarbershop.ownerPhone,
        password: password,
        confirm_password: password,
        role: 'tenant_owner'
      });

      // 2. Login as the new owner to create tenant
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: newBarbershop.ownerEmail,
        password: password
      });

      // 3. Create the tenant/business with the owner's token
      const tenantResponse = await axios.post(`${API_URL}/tenants`, {
        business_name: newBarbershop.businessName,
        business_type: newBarbershop.businessType,
        address: newBarbershop.address,
        phone: newBarbershop.phone,
        website: newBarbershop.website,
        timezone: newBarbershop.timezone
      }, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.access_token}`
        }
      });

      // 4. Initialize default services for the new business
      await axios.post(`${API_URL}/services/initialize-default`, {}, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.access_token}`,
          'X-Tenant-ID': tenantResponse.data.id
        }
      });

      // Store credentials for display
      setNewBarbershopCredentials({
        businessName: newBarbershop.businessName,
        ownerName: `${newBarbershop.ownerFirstName} ${newBarbershop.ownerLastName}`,
        email: newBarbershop.ownerEmail,
        password: password,
        loginUrl: `${window.location.origin}/login`
      });

      // Add to local state
      const newTenantForDisplay = {
        id: tenantResponse.data.id,
        business_name: newBarbershop.businessName,
        owner_name: `${newBarbershop.ownerFirstName} ${newBarbershop.ownerLastName}`,
        owner_email: newBarbershop.ownerEmail,
        business_type: newBarbershop.businessType,
        created_at: new Date(),
        is_active: true,
        stats: {
          active_barbers: 0,
          appointments_this_month: 0,
          connected_calendars: 0,
          recent_activity: 0
        }
      };

      setTenants(prev => [...prev, newTenantForDisplay]);

      // Reset form
      setNewBarbershop({
        businessName: '',
        businessType: 'salon',
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        ownerPhone: '',
        address: '',
        phone: '',
        website: '',
        timezone: 'America/New_York'
      });

      setShowAddBarbershopModal(false);
      setShowCredentialsModal(true);

    } catch (error) {
      console.error('Error adding barbershop:', error);
      alert('Error adding barbershop: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAddingBarbershop(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const sendCredentials = () => {
    // In a real app, this would send an email
    const emailBody = `Welcome to Avella AI!

Your barbershop "${newBarbershopCredentials.businessName}" has been set up successfully.

Login Details:
Email: ${newBarbershopCredentials.email}
Password: ${newBarbershopCredentials.password}
Login URL: ${newBarbershopCredentials.loginUrl}

You can now login to manage your appointments, barbers, and connect your Google Calendars.

Best regards,
Avella AI Team`;

    // Create mailto link
    const mailtoLink = `mailto:${newBarbershopCredentials.email}?subject=Welcome to Avella AI - Login Credentials&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  const handleImpersonate = async (tenantId) => {
    if (!confirm('Are you sure you want to impersonate this tenant?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/tenants/${tenantId}/impersonate`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Store the impersonation token and tenant ID
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('impersonating_tenant_id', tenantId);
      localStorage.setItem('is_impersonating', 'true');
      
      // Redirect to tenant dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error impersonating tenant:', error);
      alert('Failed to impersonate tenant: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSuspend = async (tenantId) => {
    const reason = prompt('Enter reason for suspension (optional):');
    if (reason === null) return; // User clicked cancel
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/tenants/${tenantId}/suspend`,
        null,
        {
          params: { reason },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update local state
      setTenants(prev => prev.map(t => 
        t.id === tenantId ? {...t, is_active: false} : t
      ));
      
      alert('Tenant suspended successfully');
    } catch (error) {
      console.error('Error suspending tenant:', error);
      alert('Failed to suspend tenant: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUnsuspend = async (tenantId) => {
    if (!confirm('Are you sure you want to unsuspend this tenant?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/tenants/${tenantId}/unsuspend`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update local state
      setTenants(prev => prev.map(t => 
        t.id === tenantId ? {...t, is_active: true} : t
      ));
      
      alert('Tenant unsuspended successfully');
    } catch (error) {
      console.error('Error unsuspending tenant:', error);
      alert('Failed to unsuspend tenant: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (tenantId) => {
    if (!confirm('Are you sure you want to DELETE this tenant? This action cannot be undone.')) return;
    
    const confirmText = prompt('Type "DELETE" to confirm:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/admin/tenants/${tenantId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Remove from local state
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      
      alert('Tenant deleted successfully');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to delete tenant: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Avella AI - Master Admin</h1>
              <p className="text-gray-600">System-wide management and oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddBarbershopModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                data-testid="add-barbershop-btn"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Barbershop</span>
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500">Logged in as</div>
                <div className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</div>
                <div className="text-sm text-purple-600 font-medium">Master Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveView('tenants')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'tenants' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tenants
            </button>
            <button
              onClick={() => setActiveView('audit')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'audit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveView('killswitch')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'killswitch' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kill Switches
            </button>
            <button
              onClick={() => setActiveView('integrations')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'integrations' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Integration Health
            </button>
            <button
              onClick={() => setActiveView('errors')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'errors' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Error Center
            </button>
            <button
              onClick={() => setActiveView('templates')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'templates' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Copy Library
            </button>
            <button
              onClick={() => setActiveView('metrics')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeView === 'metrics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Metrics
            </button>
          </div>
        </div>

        {/* System Stats */}
        {activeView === 'tenants' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 mb-1">Total Tenants</div>
                <div className="text-3xl font-bold text-blue-600">{systemStats.total_tenants}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 mb-1">Total Barbers</div>
                <div className="text-3xl font-bold text-green-600">{systemStats.total_barbers}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 mb-1">Appointments Today</div>
                <div className="text-3xl font-bold text-purple-600">{systemStats.appointments_today}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 mb-1">Connected Calendars</div>
                <div className="text-3xl font-bold text-yellow-600">{systemStats.connected_calendars}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 mb-1">Recent Signups</div>
                <div className="text-3xl font-bold text-indigo-600">{systemStats.recent_signups}</div>
                <div className="text-sm text-gray-500">Last 7 days</div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search barbershops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Barbershops</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.business_name}</div>
                          <div className="text-sm text-gray-500">{tenant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.owner_name}</div>
                      <div className="text-sm text-gray-500">{tenant.owner_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                        {tenant.business_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{tenant.stats.active_barbers} barbers</div>
                      <div>{tenant.stats.appointments_this_month} appointments</div>
                      <div>{tenant.stats.connected_calendars}/{tenant.stats.active_barbers} calendars</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tenant)}
                        <span className="text-sm font-medium">{getStatusText(tenant)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.created_at.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleImpersonate(tenant.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Impersonate"
                        >
                          Impersonate
                        </button>
                        {tenant.is_active ? (
                          <button 
                            onClick={() => handleSuspend(tenant.id)}
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            title="Suspend"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUnsuspend(tenant.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Unsuspend"
                          >
                            Unsuspend
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(tenant.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </div>
          </>
        )}

        {/* Audit Logs View */}
        {activeView === 'audit' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Logs</h2>
            <p className="text-gray-600">Audit log viewer coming soon...</p>
          </div>
        )}

        {/* Kill Switches View */}
        {activeView === 'killswitch' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kill Switches</h2>
            <p className="text-gray-600">Kill switch management coming soon...</p>
          </div>
        )}

        {/* Integration Health View */}
        {activeView === 'integrations' && <IntegrationHealth />}

        {/* Error Center View */}
        {activeView === 'errors' && <ErrorCenter />}

        {/* Copy Library View */}
        {activeView === 'templates' && <CopyLibrary />}

        {/* Metrics View */}
        {activeView === 'metrics' && <MetricsDashboard />}
      </div>

      {/* Add Barbershop Modal */}
      {showAddBarbershopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Add New Barbershop</h2>
            
            <form onSubmit={handleAddBarbershop} className="space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={newBarbershop.businessName}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, businessName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Elite Hair Studio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                    <select
                      value={newBarbershop.businessType}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, businessType: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {businessTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newBarbershop.address}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, address: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                    <input
                      type="tel"
                      value={newBarbershop.phone}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={newBarbershop.website}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, website: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone *</label>
                    <select
                      value={newBarbershop.timezone}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, timezone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newBarbershop.ownerFirstName}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, ownerFirstName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newBarbershop.ownerLastName}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, ownerLastName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newBarbershop.ownerEmail}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, ownerEmail: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={newBarbershop.ownerPhone}
                      onChange={(e) => setNewBarbershop(prev => ({...prev, ownerPhone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBarbershopModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={addingBarbershop}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingBarbershop}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {addingBarbershop && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{addingBarbershop ? 'Creating...' : 'Create Barbershop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && newBarbershopCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Barbershop Created Successfully!</h2>
              <p className="text-gray-600">"{newBarbershopCredentials.businessName}" has been set up</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Login Credentials for {newBarbershopCredentials.ownerName}:</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Email:</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={newBarbershopCredentials.email} 
                        readOnly 
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(newBarbershopCredentials.email)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Password:</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={newBarbershopCredentials.password} 
                        readOnly 
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(newBarbershopCredentials.password)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Login URL:</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={newBarbershopCredentials.loginUrl} 
                        readOnly 
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(newBarbershopCredentials.loginUrl)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please save these credentials and share them securely with the business owner. 
                  They can change their password after first login.
                </p>
              </div>
            </div>

            <div className="flex justify-between space-x-3 mt-6">
              <button
                onClick={sendCredentials}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Email Credentials</span>
              </button>
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setNewBarbershopCredentials(null);
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdminDashboard;