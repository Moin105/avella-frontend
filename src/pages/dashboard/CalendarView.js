import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Clock,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const CalendarView = () => {
  const { currentTenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAppointment, setHoveredAppointment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Load appointments and barbers when component mounts or tenant changes
  useEffect(() => {
    if (currentTenant) {
      loadAppointments();
      loadBarbers();
    }
  }, [currentTenant, currentDate, viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // Calculate date range for the current view
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      if (viewMode === 'week') {
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        endDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
      } else if (viewMode === 'month') {
        startDate.setDate(1);
        endDate.setMonth(currentDate.getMonth() + 1, 0);
      }
      // For day view, startDate and endDate are the same day
      
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        },
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });
      
      // Transform API data to calendar format
      const transformedAppointments = response.data.map(apt => ({
        id: apt.id,
        title: `${apt.service?.name || 'Service'} - ${apt.client?.name || apt.customer?.name || 'Client'}`,
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        barber: apt.barber?.name || 'Unknown',
        barber_id: apt.barber_id,
        client: apt.client?.name || apt.customer?.name || 'Client',
        service: apt.service?.name || 'Service',
        status: apt.status,
        customer_phone: apt.client?.phone || apt.customer?.phone,
        customer_email: apt.client?.email || apt.customer?.email,
        notes: apt.notes
      }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
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
      
      // Transform barbers data and add colors
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
      const transformedBarbers = [
        { id: 'all', name: 'All Barbers', color: '#3B82F6' },
        ...response.data.map((barber, index) => ({
          id: barber.id,
          name: barber.name,
          color: colors[index % colors.length]
        }))
      ];
      
      setBarbers(transformedBarbers);
    } catch (error) {
      console.error('Error loading barbers:', error);
      setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour: hour
    };
  });

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => {
      return apt.start.toDateString() === date.toDateString();
    });
  };

  const getAppointmentStyle = (appointment) => {
    const startHour = appointment.start.getHours();
    const startMinute = appointment.start.getMinutes();
    const endHour = appointment.end.getHours();
    const endMinute = appointment.end.getMinutes();
    
    const startPercent = (startHour * 60 + startMinute) / (24 * 60) * 100;
    const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (24 * 60) * 100;
    
    const barber = barbers.find(b => b.name === appointment.barber);
    const backgroundColor = barber ? barber.color : '#3B82F6';
    
    return {
      top: `${startPercent}%`,
      height: `${duration}%`,
      backgroundColor,
      opacity: appointment.status === 'confirmed' ? 1 : 0.7
    };
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAppointmentHover = (appointment, event) => {
    setHoveredAppointment(appointment);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleAppointmentLeave = () => {
    setHoveredAppointment(null);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200"></div>
            {timeSlots.filter(slot => slot.hour >= 8 && slot.hour <= 20).map((slot, index) => (
              <div key={index} className="h-16 border-b border-gray-200 p-2 text-xs text-gray-500">
                {slot.time}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white relative">
              {/* Day header */}
              <div className="h-16 border-b border-gray-200 p-2 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  day.toDateString() === new Date().toDateString()
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              
              {/* Time slots */}
              <div className="relative" style={{ height: `${13 * 64}px` }}>
                {timeSlots.filter(slot => slot.hour >= 8 && slot.hour <= 20).map((slot, index) => (
                  <div key={index} className="absolute w-full h-16 border-b border-gray-100" 
                       style={{ top: `${index * 64}px` }}>
                  </div>
                ))}
                
                {/* Appointments for this day */}
                {getAppointmentsForDay(day).map((appointment) => {
                  if (selectedBarber !== 'all' && appointment.barber_id !== selectedBarber) {
                    return null;
                  }
                  
                  const startHour = appointment.start.getHours();
                  const startMinute = appointment.start.getMinutes();
                  const duration = (appointment.end - appointment.start) / (1000 * 60); // minutes
                  
                  const topPosition = ((startHour - 8) * 64) + (startMinute * 64 / 60);
                  const height = (duration * 64 / 60);
                  
                  const barber = barbers.find(b => b.name === appointment.barber);
                  
                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: barber ? barber.color : '#3B82F6',
                        opacity: appointment.status === 'confirmed' ? 1 : 0.7
                      }}
                      onMouseEnter={(e) => handleAppointmentHover(appointment, e)}
                      onMouseLeave={handleAppointmentLeave}
                    >
                      <div className="font-medium truncate">{appointment.client}</div>
                      <div className="">{appointment.service}</div>
                      <div className="">{formatTime(appointment.start)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" data-testid="calendar-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          
          {/* Navigation */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-white rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric'
              })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-white rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barber Filter */}
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {barbers.map(barber => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && (
              <div className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Day view implementation coming soon</p>
              </div>
            )}
            {viewMode === 'month' && (
              <div className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Month view implementation coming soon</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-600">Barbers:</span>
          {barbers.filter(b => b.id !== 'all').map(barber => (
            <div key={barber.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: barber.color }}
              ></div>
              <span className="text-gray-700">{barber.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredAppointment && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{hoveredAppointment.client}</h3>
              <p className="text-sm text-gray-600">{hoveredAppointment.service}</p>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{formatDate(hoveredAppointment.start)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  {formatTime(hoveredAppointment.start)} - {formatTime(hoveredAppointment.end)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{hoveredAppointment.barber}</span>
              </div>
            </div>

            {/* Contact Information */}
            {(hoveredAppointment.customer_phone || hoveredAppointment.customer_email) && (
              <div className="border-t border-gray-100 pt-2 space-y-2">
                {hoveredAppointment.customer_phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.customer_phone}</span>
                  </div>
                )}
                {hoveredAppointment.customer_email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.customer_email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {hoveredAppointment.notes && (
              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{hoveredAppointment.notes}</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  hoveredAppointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {hoveredAppointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;