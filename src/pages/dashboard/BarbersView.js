import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Link
} from 'lucide-react';

const BarbersView = () => {
  const { currentTenant } = useTenant();
  const [barbers, setBarbers] = useState([]);
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    bio: '',
    is_active: true
  });

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Real barber data will be loaded from API

  useEffect(() => {
    if (currentTenant) {
      loadBarbers();
    }
  }, [currentTenant]);

  useEffect(() => {
    filterBarbers();
  }, [barbers, searchTerm]);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log('Loading barbers for tenant:', currentTenant?.id);
      const response = await axios.get(`${API_URL}/barbers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      console.log('Barbers response:', response.data);
      setBarbers(response.data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
      // Fallback to empty array if API fails
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBarbers = () => {
    let filtered = [...barbers];

    if (searchTerm) {
      filtered = filtered.filter(barber => 
        barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBarbers(filtered);
  };

  const getConnectionStatus = (barber) => {
    const hasGoogle = barber.google_calendar_integration?.connected;
    const hasMicrosoft = barber.microsoft_calendar_integration?.connected;
    
    if (!hasGoogle && !hasMicrosoft) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'No Calendar Connected',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }

    // Check for sync issues
    const googleLastSync = hasGoogle ? new Date(barber.google_calendar_integration?.last_sync || new Date()) : null;
    const microsoftLastSync = hasMicrosoft ? new Date(barber.microsoft_calendar_integration?.last_sync || new Date()) : null;
    const now = new Date();
    
    const hasSyncIssue = (googleLastSync && (now - googleLastSync) / (1000 * 60 * 60) > 24) ||
                        (microsoftLastSync && (now - microsoftLastSync) / (1000 * 60 * 60) > 24);

    if (hasSyncIssue) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        text: 'Sync Issue',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    }

    const connectedCount = (hasGoogle ? 1 : 0) + (hasMicrosoft ? 1 : 0);
    return {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: `${connectedCount} Calendar${connectedCount > 1 ? 's' : ''} Connected`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  };

  const formatSchedule = (workingHours) => {
    if (!workingHours || typeof workingHours !== 'object') {
      return 'No schedule set';
    }
    
    const workDays = Object.entries(workingHours)
      .filter(([day, hours]) => hours && hours.is_working)
      .map(([day, hours]) => day.charAt(0).toUpperCase());
    
    return workDays.length > 0 ? workDays.join(', ') : 'No schedule set';
  };


  const handleConnectCalendar = async (barberId, provider = 'google') => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const endpoint = provider === 'microsoft' 
        ? `${API_URL}/barbers/${barberId}/connect-microsoft-calendar`
        : `${API_URL}/barbers/${barberId}/connect-calendar`;
      
      const response = await axios.post(endpoint, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      
      if (response.data.authUrl) {
        // Store barber ID and provider in session storage for callback
        sessionStorage.setItem('connecting_barber_id', barberId);
        sessionStorage.setItem('connecting_provider', provider);
        window.location.href = response.data.authUrl;
      } else {
        alert('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      alert('Failed to connect calendar. Please try again.');
    }
  };

  const handleEditBarber = (barber) => {
    setSelectedBarber(barber);
    setNewBarber({
      name: barber.name || '',
      email: barber.email || '',
      phone: barber.phone || '',
      specialties: barber.specialties || [],
      bio: barber.bio || '',
      is_active: barber.is_active
    });
    setShowBarberModal(true);
  };

  const handleCreateBarber = () => {
    setSelectedBarber(null);
    setNewBarber({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      bio: '',
      is_active: true
    });
    setShowBarberModal(true);
  };

  const handleSaveBarber = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (selectedBarber) {
        // Update existing barber
        const response = await axios.put(`${API_URL}/barbers/${selectedBarber.id}`, newBarber, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setBarbers(prev => prev.map(b => b.id === selectedBarber.id ? response.data : b));
        alert('Barber updated successfully');
      } else {
        // Create new barber
        const response = await axios.post(`${API_URL}/barbers`, newBarber, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setBarbers(prev => [...prev, response.data]);
        alert('Barber created successfully');
      }
      
      setShowBarberModal(false);
      setSelectedBarber(null);
    } catch (error) {
      console.error('Error saving barber:', error);
      alert('Failed to save barber. Please try again.');
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (window.confirm('Are you sure you want to delete this barber? This will also cancel all their appointments.')) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        await axios.delete(`${API_URL}/barbers/${barberId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setBarbers(prev => prev.filter(b => b.id !== barberId));
        alert('Barber deleted successfully');
      } catch (error) {
        console.error('Error deleting barber:', error);
        alert('Failed to delete barber. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="barbers-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barbers & Staff</h1>
          <p className="text-gray-600">Manage your team and their calendar integrations</p>
        </div>
        <button
          onClick={handleCreateBarber}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          data-testid="add-barber-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Add Barber</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Barbers</div>
          <div className="text-3xl font-bold text-gray-900">{barbers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Connected Calendars</div>
          <div className="text-3xl font-bold text-green-600">
            {barbers.reduce((count, b) => {
              const googleConnected = b.google_calendar_integration?.connected ? 1 : 0;
              const microsoftConnected = b.microsoft_calendar_integration?.connected ? 1 : 0;
              return count + googleConnected + microsoftConnected;
            }, 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Active Barbers</div>
          <div className="text-3xl font-bold text-blue-600">
            {barbers.filter(b => b.is_active).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Services</div>
          <div className="text-3xl font-bold text-purple-600">
            {barbers.reduce((acc, b) => acc + (b.services?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search barbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBarbers.map((barber) => {
          const connectionStatus = getConnectionStatus(barber);
          
          return (
            <div key={barber.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {barber.name.split(' ').map(n => n.charAt(0)).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{barber.name}</h3>
                      <div className={`flex items-center space-x-2 ${connectionStatus.bgColor} px-2 py-1 rounded-full`}>
                        {connectionStatus.icon}
                        <span className={`text-sm font-medium ${connectionStatus.color}`}>
                          {connectionStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditBarber(barber)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{barber.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{barber.email}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{barber.services?.length || 0}</div>
                    <div className="text-sm text-gray-500">Services</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{barber.is_active ? 'Active' : 'Inactive'}</div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {barber.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Schedule & Next Appointment */}
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Schedule</h4>
                    <p className="text-sm text-gray-600">{formatSchedule(barber.working_hours)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Status</h4>
                    <p className="text-sm text-gray-600">{barber.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {/* Calendar connection moved to Integrations page at tenant-level */}
                <div className="mt-4">
                  <a href="/dashboard/integrations" className="w-full inline-flex items-center justify-center bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100">
                    <Link className="h-4 w-4 mr-2" />
                    Manage Calendar Integrations
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBarbers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No barbers found matching your search' : 'No barbers yet'}
          </p>
        </div>
      )}

      {/* Barber Modal Placeholder */}
      {showBarberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {selectedBarber ? 'Edit Barber' : 'Add New Barber'}
            </h2>
            <form onSubmit={handleSaveBarber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({...newBarber, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter barber name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newBarber.email}
                  onChange={(e) => setNewBarber({...newBarber, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newBarber.phone}
                  onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={newBarber.bio}
                  onChange={(e) => setNewBarber({...newBarber, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter barber bio/description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                <input
                  type="text"
                  value={newBarber.specialties.join(', ')}
                  onChange={(e) => setNewBarber({...newBarber, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter specialties (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple specialties with commas</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newBarber.is_active}
                  onChange={(e) => setNewBarber({...newBarber, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBarberModal(false);
                    setSelectedBarber(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedBarber ? 'Update' : 'Create'} Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersView;