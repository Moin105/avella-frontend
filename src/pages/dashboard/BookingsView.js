import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import axios from 'axios';
import { convertToTenantTimezone, getTimezoneDisplayName } from '../../utils/timezone';
import { 
  Calendar, 
  Filter, 
  Plus, 
  Search,
  Phone,
  MessageSquare,
  Globe,
  Monitor,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const BookingsView = () => {
  const { currentTenant } = useTenant();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [barberFilter, setBarberFilter] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    barber_id: '',
    date: '',
    time: '',
    notes: ''
  });

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Real data will be loaded from API

  useEffect(() => {
    if (currentTenant) {
      loadAppointments();
      loadServices();
      loadBarbers();
    }
  }, [currentTenant]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter, barberFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      
      // Convert appointment times to tenant timezone
      const tenantTimezone = currentTenant?.timezone || 'America/New_York';
      const processedAppointments = (response.data || []).map(appointment => {
        const startTimeConverted = convertToTenantTimezone(appointment.start_time, tenantTimezone);
        const endTimeConverted = convertToTenantTimezone(appointment.end_time, tenantTimezone);
        
        // Detect Retell appointments and set channel
        let channel = appointment.channel || 'web';
        if (appointment.booking_hash && appointment.booking_hash.startsWith('retell_')) {
          channel = 'ai_agent';
        }
        
        return {
          ...appointment,
          time: startTimeConverted.time,
          date: startTimeConverted.date,
          fullDateTime: startTimeConverted.fullDateTime,
          endTime: endTimeConverted.time,
          timezone: tenantTimezone,
          channel: channel
        };
      });
      
      setAppointments(processedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Show empty state if API fails
      setAppointments([]);
    } finally {
      setLoading(false);
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
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      // Set empty array if API fails
      setServices([]);
    }
  };

  const loadBarbers = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/barbers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      setBarbers(response.data);
    } catch (error) {
      console.error('Error loading barbers:', error);
      // Set empty array if API fails
      setBarbers([]);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setCreatingBooking(true);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // Find selected service and barber details
      const selectedService = services.find(s => s.id === newBooking.service_id);
      const selectedBarber = barbers.find(b => b.id === newBooking.barber_id);
      
      if (!selectedService || !selectedBarber) {
        alert('Please select both service and barber');
        return;
      }

      // Create appointment data
      const appointmentData = {
        service_id: newBooking.service_id,
        barber_id: newBooking.barber_id,
        start_time: `${newBooking.date}T${newBooking.time}:00`,
        end_time: `${newBooking.date}T${newBooking.time}:00`, // Will be calculated based on service duration
        customer: {
          name: newBooking.customer_name,
          phone: newBooking.customer_phone,
          email: newBooking.customer_email || '',
          notes: newBooking.notes || ''
        },
        status: 'confirmed'
      };

      const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        alert('Booking created successfully!');
        setShowBookingModal(false);
        setNewBooking({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          service_id: '',
          barber_id: '',
          date: '',
          time: '',
          notes: ''
        });
        loadAppointments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setCreatingBooking(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        (apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.client?.phone?.includes(searchTerm)) ||
        (apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.barber?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Barber filter
    if (barberFilter !== 'all') {
      filtered = filtered.filter(apt => apt.barber.id === barberFilter);
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'tentative': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel) => {
    if (!channel) return <Globe className="h-4 w-4" />;
    switch (channel.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'web': return <Globe className="h-4 w-4" />;
      case 'front_desk': return <Monitor className="h-4 w-4" />;
      case 'ai_agent': return <Phone className="h-4 w-4" />; // AI Agent uses phone icon
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const formatChannelName = (channel) => {
    if (!channel) return 'Unknown';
    switch (channel.toLowerCase()) {
      case 'front_desk': return 'Front Desk';
      case 'call': return 'Call';
      case 'sms': return 'SMS';
      case 'web': return 'Web';
      case 'ai_agent': return 'AI Agent/Call';
      default: return channel;
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
    <div className="space-y-6" data-testid="bookings-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage all appointments and bookings</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          data-testid="new-booking-btn"
        >
          <Plus className="h-4 w-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="tentative">Tentative</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Barber Filter */}
          <select
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Barbers</option>
            <option value="david-1">David</option>
            <option value="susan-1">Susan</option>
            <option value="john-1">John</option>
          </select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments && filteredAppointments.length > 0 ? filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment?.time || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{appointment?.date || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.client?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{appointment.client?.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.service?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{appointment.service?.duration_minutes || appointment.service?.duration || 0}min</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.barber?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment?.status)}`}>
                      {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {getChannelIcon(appointment?.channel)}
                      <span>{formatChannelName(appointment?.channel)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New Booking</h2>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBooking.customer_name}
                    onChange={(e) => setNewBooking({...newBooking, customer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBooking.customer_phone}
                    onChange={(e) => setNewBooking({...newBooking, customer_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newBooking.customer_email}
                    onChange={(e) => setNewBooking({...newBooking, customer_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service *
                  </label>
                  <select
                    required
                    value={newBooking.service_id}
                    onChange={(e) => setNewBooking({...newBooking, service_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    {services && services.length > 0 ? services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service?.name || 'Unknown Service'} ({service?.duration_minutes || 0} min)
                      </option>
                    )) : (
                      <option value="" disabled>No services available</option>
                    )}
                  </select>
                </div>

                {/* Barber */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barber *
                  </label>
                  <select
                    required
                    value={newBooking.barber_id}
                    onChange={(e) => setNewBooking({...newBooking, barber_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a barber</option>
                    {barbers && barbers.length > 0 ? barbers.map(barber => (
                      <option key={barber.id} value={barber.id}>
                        {barber?.name || 'Unknown Barber'}
                      </option>
                    )) : (
                      <option value="" disabled>No barbers available</option>
                    )}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBooking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {creatingBooking ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsView;