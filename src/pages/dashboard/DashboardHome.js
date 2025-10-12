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

  // Mock data for demonstration - replace with real API calls
  const mockStats = {
    todaysBookings: { count: 18, change: '+4', changeType: 'positive' },
    noShows: { count: 1, target: 'target ≤ 2' },
    nextAvailable: { time: 'Today 3:15 PM', barber: 'Any barber' },
    revenue: { amount: '$540', change: '+$120 vs avg', changeType: 'positive' }
  };

  const mockAppointments = [
    {
      id: 1,
      time: '9:00 AM',
      client: 'Bob Lee',
      service: "Men's Haircut (30m)",
      barber: 'David',
      status: 'Confirmed',
      channel: 'Call'
    },
    {
      id: 2,
      time: '9:45 AM',
      client: 'Ana Ruiz',
      service: "Women's Haircut (60m)",
      barber: 'Susan',
      status: 'Confirmed',
      channel: 'Web'
    },
    {
      id: 3,
      time: '10:00 AM',
      client: 'Marco S.',
      service: 'Men + Beard (45m)',
      barber: 'John',
      status: 'Pending',
      channel: 'Call'
    },
    {
      id: 4,
      time: '11:15 AM',
      client: 'T. Nguyen',
      service: "Men's Haircut (30m)",
      barber: 'David',
      status: 'Confirmed',
      channel: 'SMS'
    },
    {
      id: 5,
      time: '1:00 PM',
      client: 'K. Ortiz',
      service: "Men's Haircut (30m)",
      barber: 'David',
      status: 'Busy→Alt 1:30p',
      channel: 'Call'
    },
    {
      id: 6,
      time: '3:30 PM',
      client: 'Walk-in Hold',
      service: 'Any (30m)',
      barber: 'Any',
      status: 'Tentative',
      channel: 'Front d'
    }
  ];

  const mockBarbers = [
    { name: 'David', nextAppointment: 'Next: 1:30 PM', connected: true },
    { name: 'Susan', nextAppointment: 'Next: 2:15 PM', connected: true },
    { name: 'John', nextAppointment: '', connected: false, needsConnection: true }
  ];

  const businessHours = [
    'Mon-Fri 9:00a-6:00p',
    'Sat 10:00a-4:00p',
    'Sun Closed'
  ];

  const servicesList = [
    'Men 30m',
    'Men+Beard 45m', 
    'Women 60m',
    'Buffer 5m'
  ];

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
          <div className="text-3xl font-bold text-gray-900">{mockStats.todaysBookings.count}</div>
          <div className="text-sm text-green-600 mt-1">{mockStats.todaysBookings.change} vs yesterday</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">No-shows</div>
          <div className="text-3xl font-bold text-gray-900">{mockStats.noShows.count}</div>
          <div className="text-sm text-gray-500 mt-1">{mockStats.noShows.target}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Next available</div>
          <div className="text-lg font-semibold text-gray-900">{mockStats.nextAvailable.time}</div>
          <div className="text-sm text-gray-500 mt-1">{mockStats.nextAvailable.barber}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Revenue (today)</div>
          <div className="text-3xl font-bold text-gray-900">{mockStats.revenue.amount}</div>
          <div className="text-sm text-green-600 mt-1">{mockStats.revenue.change}</div>
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
                  {mockAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.barber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {getChannelIcon(appointment.channel)}
                          <span>{appointment.channel}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              {mockBarbers.map((barber, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{barber.name}</div>
                    {barber.nextAppointment && (
                      <div className="text-sm text-gray-500">{barber.nextAppointment}</div>
                    )}
                    {barber.needsConnection && (
                      <div className="text-sm text-gray-500">Connect required</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {barber.connected ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-600">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
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