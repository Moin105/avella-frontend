import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Copy,
  Settings,
  ChevronDown,
  Phone,
  MessageSquare,
  Globe,
  Monitor,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const DashboardHome = () => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [selectedService, setSelectedService] = useState('all');

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Real stats will be calculated from actual data
  const [stats, setStats] = useState({
    todaysBookings: { count: 0, change: '+0', changeType: 'neutral' },
    noShows: { count: 0, target: 'target ≤ 2' },
    nextAvailable: { time: 'No availability', barber: 'No barbers' },
    revenue: { amount: '$0', change: '+$0 vs avg', changeType: 'neutral' }
  });

  // Load real data when tenant is available
  useEffect(() => {
    if (currentTenant) {
      loadDashboardData();
    }
  }, [currentTenant]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadAppointments(),
        loadBarbers(),
        loadServices()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const loadBarbers = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log('Dashboard loading barbers for tenant:', currentTenant?.id);
      const response = await axios.get(`${API_URL}/barbers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      console.log('Dashboard barbers response:', response.data);
      setBarbers(response.data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
      setBarbers([]);
    }
  };

  const loadServices = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/services`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  // Calculate stats from real data
  useEffect(() => {
    calculateStats();
  }, [appointments, barbers, services]);

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = (appointments || []).filter(apt => 
      apt.date === today && apt.status === 'confirmed'
    );
    
    const noShows = (appointments || []).filter(apt => apt.status === 'no_show');
    const totalRevenue = (appointments || [])
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    setStats({
      todaysBookings: { 
        count: todaysAppointments.length, 
        change: '+0', 
        changeType: 'neutral' 
      },
      noShows: { 
        count: noShows.length, 
        target: 'target ≤ 2' 
      },
      nextAvailable: { 
        time: (barbers && barbers.length > 0) ? 'Check calendar' : 'No barbers', 
        barber: (barbers && barbers.length > 0) ? barbers[0].name : 'No barbers' 
      },
      revenue: { 
        amount: `$${totalRevenue}`, 
        change: '+$0 vs avg', 
        changeType: 'neutral' 
      }
    });
  };

  const businessHours = currentTenant?.business_hours ? 
    Object.entries(currentTenant.business_hours)
      .filter(([day, hours]) => hours && hours.start && hours.end)
      .map(([day, hours]) => 
        `${day.charAt(0).toUpperCase() + day.slice(1)} ${hours.start}-${hours.end}`
      ) : ['No hours set'];

  const servicesList = services && services.length > 0 ? 
    services.map(service => 
      `${service.name} ${service.duration_minutes || 0}m`
    ) : ['No services available'];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'tentative': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: 
        if (status.includes('Busy')) return 'text-orange-600 bg-orange-50';
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'web': return <Globe className="h-4 w-4" />;
      case 'front d': return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="dashboard-home">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentTenant?.business_name} • {currentTenant?.business_type || 'Barbershop'}
          </h1>
        </div>
        <div className="text-right text-sm text-gray-500">
          {user?.first_name} • Owner
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Today's bookings</div>
          <div className="text-3xl font-bold text-gray-900">{stats.todaysBookings.count}</div>
          <div className="text-sm text-green-600 mt-1">{stats.todaysBookings.change} vs yesterday</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">No-shows</div>
          <div className="text-3xl font-bold text-gray-900">{stats.noShows.count}</div>
          <div className="text-sm text-gray-500 mt-1">{stats.noShows.target}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Next available</div>
          <div className="text-lg font-semibold text-gray-900">{stats.nextAvailable.time}</div>
          <div className="text-sm text-gray-500 mt-1">{stats.nextAvailable.barber}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Revenue (today)</div>
          <div className="text-3xl font-bold text-gray-900">{stats.revenue.amount}</div>
          <div className="text-sm text-green-600 mt-1">{stats.revenue.change}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Date:</span>
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="today">Today (Mon)</option>
                <option value="tomorrow">Tomorrow (Tue)</option>
                <option value="week">This Week</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Barber:</span>
              <select 
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="david">David</option>
                <option value="susan">Susan</option>
                <option value="john">John</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Service:</span>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="mens">Men's Haircut</option>
                <option value="womens">Women's Haircut</option>
                <option value="beard">Men + Beard</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-600">Timezone:</span>
              <span className="text-sm text-gray-900">{currentTenant?.timezone || 'America/New_York'}</span>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>{appointment.time || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{appointment.date || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.client?.name || appointment.customer_name || appointment.client_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.service?.name || appointment.service_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.barber?.name || appointment.barber_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getChannelIcon(appointment.channel || 'web')}
                            <span>{appointment.channel || 'web'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No appointments found. Create your first appointment to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New manual booking</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-2">
                  <Copy className="h-4 w-4" />
                  <span>Copy booking link</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Connect calendars</span>
                </div>
              </button>
            </div>
          </div>

          {/* Barbers & Calendars */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Barbers & calendars</h3>
            <div className="space-y-4">
              {barbers.length > 0 ? (
                barbers.map((barber) => (
                  <div key={barber.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{barber.name}</div>
                      <div className="text-sm text-gray-500">{barber.role || 'Staff'}</div>
                      {barber.services && barber.services.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {barber.services.length} service{barber.services.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {barber.is_active ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No barbers found. Add staff members to get started!
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business hours</h3>
            <div className="space-y-2">
              {businessHours.map((hours, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {hours}
                </div>
              ))}
            </div>
          </div>

          {/* Services & Durations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & durations</h3>
            <div className="space-y-2">
              {servicesList.map((service, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Use the 'Quick actions' to add a manual booking, connect calendars, or share your booking link.
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;