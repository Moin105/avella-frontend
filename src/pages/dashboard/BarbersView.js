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

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Mock barber data
  const mockBarbers = [
    {
      id: 'david-1',
      name: 'David Rodriguez',
      email: 'david@example.com',
      phone: '+1 (555) 111-2222',
      specialties: ["Men's Haircuts", "Fades", "Classic Cuts"],
      bio: 'Experienced barber with 8 years in the industry. Specializes in modern fades and classic gentleman cuts.',
      profileImage: null,
      isActive: true,
      calendarIntegration: {
        connected: true,
        provider: 'google',
        lastSync: new Date(2025, 9, 4, 10, 30), // Oct 4, 2025, 10:30 AM
        calendarId: 'david@example.com'
      },
      schedule: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: null
      },
      stats: {
        totalAppointments: 156,
        thisMonth: 28,
        avgRating: 4.8,
        completionRate: 95
      },
      nextAppointment: new Date(2025, 9, 4, 13, 30) // Oct 4, 2025, 1:30 PM
    },
    {
      id: 'susan-1',
      name: 'Susan Chen',
      email: 'susan@example.com',
      phone: '+1 (555) 333-4444',
      specialties: ["Women's Haircuts", "Color", "Styling", "Highlights"],
      bio: 'Creative hair stylist passionate about color and modern cuts. 10+ years experience in salon industry.',
      profileImage: null,
      isActive: true,
      calendarIntegration: {
        connected: true,
        provider: 'google',
        lastSync: new Date(2025, 9, 4, 9, 15), // Oct 4, 2025, 9:15 AM
        calendarId: 'susan@example.com'
      },
      schedule: {
        monday: { start: '10:00', end: '18:00' },
        tuesday: { start: '10:00', end: '18:00' },
        wednesday: { start: '10:00', end: '18:00' },
        thursday: { start: '10:00', end: '18:00' },
        friday: { start: '10:00', end: '18:00' },
        saturday: { start: '09:00', end: '15:00' },
        sunday: null
      },
      stats: {
        totalAppointments: 198,
        thisMonth: 35,
        avgRating: 4.9,
        completionRate: 98
      },
      nextAppointment: new Date(2025, 9, 4, 14, 15) // Oct 4, 2025, 2:15 PM
    },
    {
      id: 'john-1',
      name: 'John Martinez',
      email: 'john@example.com',
      phone: '+1 (555) 555-6666',
      specialties: ["Men's Cuts", "Beard Trimming", "Hot Towel Shaves"],
      bio: 'Traditional barber with expertise in classic techniques and modern styles.',
      profileImage: null,
      isActive: true,
      calendarIntegration: {
        connected: false,
        provider: 'google',
        lastSync: null,
        calendarId: null,
        needsConnection: true
      },
      schedule: {
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '16:00' },
        saturday: { start: '09:00', end: '14:00' },
        sunday: null
      },
      stats: {
        totalAppointments: 89,
        thisMonth: 18,
        avgRating: 4.7,
        completionRate: 92
      },
      nextAppointment: null
    }
  ];

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
      // TODO: Replace with real API call
      // const response = await axios.get(`${API_URL}/barbers`);
      // setBarbers(response.data);
      
      setBarbers(mockBarbers);
    } catch (error) {
      console.error('Error loading barbers:', error);
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
    if (!barber.calendarIntegration.connected) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'Disconnected',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }

    const lastSync = new Date(barber.calendarIntegration.lastSync);
    const now = new Date();
    const hoursSinceSync = (now - lastSync) / (1000 * 60 * 60);

    if (hoursSinceSync > 24) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        text: 'Sync Issue',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    }

    return {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: 'Connected',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  };

  const formatSchedule = (schedule) => {
    const workDays = Object.entries(schedule)
      .filter(([day, hours]) => hours !== null)
      .map(([day, hours]) => day.charAt(0).toUpperCase());
    
    return workDays.length > 0 ? workDays.join(', ') : 'No schedule set';
  };

  const formatNextAppointment = (nextAppointment) => {
    if (!nextAppointment) return 'No upcoming appointments';
    
    const now = new Date();
    const appointment = new Date(nextAppointment);
    
    if (appointment.toDateString() === now.toDateString()) {
      return `Today ${appointment.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      return appointment.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const handleConnectCalendar = async (barberId) => {
    try {
      // TODO: Implement Google Calendar OAuth flow
      // const response = await axios.post(`${API_URL}/barbers/${barberId}/connect-calendar`);
      // window.location.href = response.data.authUrl;
      
      alert('Calendar connection flow will be implemented here');
    } catch (error) {
      console.error('Error connecting calendar:', error);
    }
  };

  const handleEditBarber = (barber) => {
    setSelectedBarber(barber);
    setShowBarberModal(true);
  };

  const handleDeleteBarber = async (barberId) => {
    if (window.confirm('Are you sure you want to delete this barber? This will also cancel all their appointments.')) {
      try {
        // TODO: Add delete API call
        // await axios.delete(`${API_URL}/barbers/${barberId}`);
        setBarbers(prev => prev.filter(b => b.id !== barberId));
      } catch (error) {
        console.error('Error deleting barber:', error);
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
          onClick={() => setShowBarberModal(true)}
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
            {barbers.filter(b => b.calendarIntegration.connected).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
          <div className="text-3xl font-bold text-yellow-600">
            {barbers.length > 0 ? 
              (barbers.reduce((acc, b) => acc + b.stats.avgRating, 0) / barbers.length).toFixed(1)
              : '0.0'
            }
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-blue-600">
            {barbers.reduce((acc, b) => acc + b.stats.thisMonth, 0)}
          </div>
          <div className="text-sm text-gray-500">appointments</div>
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
                    <div className="text-2xl font-bold text-gray-900">{barber.stats.thisMonth}</div>
                    <div className="text-sm text-gray-500">This Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{barber.stats.avgRating}</div>
                    <div className="text-sm text-gray-500">Avg Rating</div>
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
                    <p className="text-sm text-gray-600">{formatSchedule(barber.schedule)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Next Appointment</h4>
                    <p className="text-sm text-gray-600">{formatNextAppointment(barber.nextAppointment)}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {!barber.calendarIntegration.connected ? (
                    <button
                      onClick={() => handleConnectCalendar(barber.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Link className="h-4 w-4" />
                      <span>Connect Calendar</span>
                    </button>
                  ) : (
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Manage Calendar</span>
                    </button>
                  )}
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
            <p className="text-gray-600 mb-4">Barber form will be implemented here</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowBarberModal(false);
                  setSelectedBarber(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {selectedBarber ? 'Update' : 'Create'} Barber
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersView;