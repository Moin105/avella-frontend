import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenant } from '../../contexts/TenantContext';
import { convertToTenantTimezone } from '../../utils/timezone';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
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
  const [barbers, setBarbers] = useState([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredAppointment, setHoveredAppointment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Load barbers
  useEffect(() => {
    if (currentTenant) {
      loadBarbers();
    }
  }, [currentTenant]);

  // Load appointments when date or barber filter changes
  useEffect(() => {
    if (currentTenant) {
      loadAppointments();
    }
  }, [currentTenant, currentDate, viewMode]);

  const loadBarbers = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/barbers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });

      const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'];
      const barberList = (response.data || []).map((barber, index) => ({
        id: barber.id,
        name: barber.name,
        color: colors[index % colors.length]
      }));
      setBarbers([{ id: 'all', name: 'All Barbers', color: '#3B82F6' }, ...barberList]);
    } catch (err) {
      console.error('Error loading barbers:', err);
      // keep default 'All' to prevent crashes
      setBarbers(prev => prev.length ? prev : [{ id: 'all', name: 'All Barbers', color: '#3B82F6' }]);
    }
  };

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

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to view appointments');
        setLoading(false);
        return;
      }

      // Calculate date range based on view mode
      let startDate, endDate;
      if (viewMode === 'week') {
        const weekDays = getWeekDays(currentDate);
        startDate = weekDays[0];
        endDate = weekDays[6];
      } else if (viewMode === 'month') {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      } else {
        // day
        startDate = new Date(currentDate);
        endDate = new Date(currentDate);
      }

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id,
          'Content-Type': 'application/json'
        },
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });

      // Transform appointments to match calendar format, supporting both API shapes
      const tenantTimezone = currentTenant?.timezone || 'America/New_York';
      const data = response.data || [];

      const transformedAppointments = data.map(apt => {
        // Possible shapes:
        // A) { date: 'YYYY-MM-DD', time: 'HH:mm', duration, staff_id/staff_name, customer_* }
        // B) { start_time, end_time, barber_id, barber, client/customer objects, service object }
        let start, end;

        if (apt.start_time) {
          start = new Date(apt.start_time);
          end = apt.end_time ? new Date(apt.end_time) : new Date(new Date(apt.start_time).getTime() + (apt.duration || 30) * 60000);
        } else if (apt.date && apt.time) {
          const [h, m] = apt.time.split(':');
          start = new Date(apt.date);
          start.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
          end = new Date(start);
          end.setMinutes(end.getMinutes() + (apt.duration || 30));
        } else {
          // Fallback: skip malformed entries
          return null;
        }

        // Convert for display
        const startConv = convertToTenantTimezone(start.toISOString(), tenantTimezone);
        const endConv = convertToTenantTimezone(end.toISOString(), tenantTimezone);

        // Detect channel (Retell etc.)
        let channel = apt.channel || 'web';
        if (apt.booking_hash && String(apt.booking_hash).startsWith('retell_')) {
          channel = 'ai_agent';
        }

        const barberName = apt.barber?.name || apt.staff_name || apt.barber_name || 'Unknown';
        const barberId = apt.barber_id || apt.staff_id || apt.barberId || apt.staffId;

        return {
          id: apt.id,
          title: `${(apt.service?.name || apt.service || 'Service')} - ${(apt.client?.name || apt.customer?.name || apt.customer_name || 'Client')}`,
          start,
          end,
          barber: barberName,
          barberId,
          client: apt.client?.name || apt.customer?.name || apt.customer_name || 'Client',
          service: apt.service?.name || apt.service || 'Service',
          status: apt.status || 'confirmed',
          phone: apt.client?.phone || apt.customer?.phone || apt.customer_phone,
          email: apt.client?.email || apt.customer?.email || apt.customer_email,
          notes: apt.notes,
          // Display helpers
          displayTime: startConv.time,
          displayDate: startConv.date,
          displayDateTime: startConv.fullDateTime,
          timezone: tenantTimezone,
          channel
        };
      }).filter(Boolean);

      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setAppointments([]);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      time: `${displayHour}:00 ${period}`,
      hour: hour
    };
  });

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => {
      return apt.start.toDateString() === date.toDateString();
    });
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

  const handleSlotClick = (date, hour, minute) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    setSelectedSlot({ date, time: slotTime });
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setShowAppointmentModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      // TODO: implement cancel API call if available
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      setShowCancelConfirm(false);
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error canceling appointment:', err);
    }
  };

  const handleAppointmentHover = (appointment, event) => {
    setHoveredAppointment(appointment);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleAppointmentLeave = () => setHoveredAppointment(null);

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

  const renderDayView = () => {
    const currentDay = new Date(currentDate);
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-white">
            <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-10"></div>
            {timeSlots.filter(slot => slot.hour >= 8 && slot.hour <= 20).map((slot, index) => (
              <div key={index} className="h-20 border-b border-gray-200 p-2 text-sm text-gray-500">
                {slot.time}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="bg-white relative">
            {/* Day header */}
            <div className="h-16 border-b border-gray-200 p-2 text-center sticky top-0 bg-white z-10">
              <div className="text-sm font-medium text-gray-900">
                {currentDay.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className={`text-2xl font-semibold ${
                currentDay.toDateString() === new Date().toDateString()
                  ? 'text-blue-600'
                  : 'text-gray-900'
              }`}>
                {currentDay.getDate()}
              </div>
            </div>

            {/* Time slots */}
            <div className="relative" style={{ height: `${13 * 80}px` }}>
              {timeSlots.filter(slot => slot.hour >= 8 && slot.hour <= 20).map((slot, index) => (
                <div 
                  key={index} 
                  className="absolute w-full h-20 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors" 
                  style={{ top: `${index * 80}px` }}
                  onClick={() => handleSlotClick(currentDay, slot.hour, 0)}
                />
              ))}

              {/* Appointments for this day */}
              {getAppointmentsForDay(currentDay).map((appointment) => {
                if (selectedBarber !== 'all' && appointment.barberId !== selectedBarber) return null;

                const startHour = appointment.start.getHours();
                const startMinute = appointment.start.getMinutes();
                const duration = (appointment.end - appointment.start) / (1000 * 60);

                const topPosition = ((startHour - 8) * 80) + (startMinute * 80 / 60);
                const height = (duration * 80 / 60);

                const barber = barbers.find(b => b.id === appointment.barberId || b.name === appointment.barber);

                return (
                  <div
                    key={appointment.id}
                    className="absolute left-2 right-2 rounded-lg p-3 text-sm text-white cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-md"
                    style={{
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      backgroundColor: barber ? barber.color : '#3B82F6',
                      opacity: appointment.status === 'confirmed' ? 1 : 0.7
                    }}
                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(appointment); }}
                    onMouseEnter={(e) => handleAppointmentHover(appointment, e)}
                    onMouseLeave={handleAppointmentLeave}
                  >
                    <div className="font-semibold">{appointment.client}</div>
                    <div className="text-xs opacity-90">{appointment.service}</div>
                    <div className="text-xs opacity-90 mt-1">{formatTime(appointment.start)} - {formatTime(appointment.end)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
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
                  <div 
                    key={index} 
                    className="absolute w-full h-16 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors" 
                    style={{ top: `${index * 64}px` }}
                    onClick={() => handleSlotClick(day, slot.hour, 0)}
                  />
                ))}

                {/* Appointments for this day */}
                {getAppointmentsForDay(day).map((appointment) => {
                  if (selectedBarber !== 'all' && appointment.barberId !== selectedBarber) return null;

                  const startHour = appointment.start.getHours();
                  const startMinute = appointment.start.getMinutes();
                  const duration = (appointment.end - appointment.start) / (1000 * 60); // minutes

                  const topPosition = ((startHour - 8) * 64) + (startMinute * 64 / 60);
                  const height = (duration * 64 / 60);

                  const barber = barbers.find(b => b.id === appointment.barberId || b.name === appointment.barber);

                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity z-10"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: barber ? barber.color : '#3B82F6',
                        opacity: appointment.status === 'confirmed' ? 1 : 0.7
                      }}
                      title={`${appointment.client}\n${appointment.service}\n${formatTime(appointment.start)} - ${formatTime(appointment.end)}\nStatus: ${appointment.status}`}
                      onClick={(e) => { e.stopPropagation(); handleAppointmentClick(appointment); }}
                      onMouseEnter={(e) => handleAppointmentHover(appointment, e)}
                      onMouseLeave={handleAppointmentLeave}
                    >
                      <div className="font-medium truncate">{appointment.client}</div>
                      <div className="truncate">{appointment.service}</div>
                      <div className="truncate">{formatTime(appointment.start)}</div>
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

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];

    // leading blanks
    for (let i = 0; i < startingDayOfWeek; i++) currentWeek.push(null);

    // days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    // trailing blanks
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-rows-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="min-h-[120px] bg-gray-50 border-r last:border-r-0"></div>;
                  }

                  const dayAppointments = getAppointmentsForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={dayIndex} 
                      className="min-h-[120px] border-r last:border-r-0 p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSlotClick(day, 9, 0)}
                    >
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-white bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map(apt => {
                          if (selectedBarber !== 'all' && apt.barberId !== selectedBarber) return null;
                          const barber = barbers.find(b => b.id === apt.barberId || b.name === apt.barber);
                          return (
                            <div
                              key={apt.id}
                              className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: barber ? barber.color : '#3B82F6', color: 'white' }}
                              onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                              onMouseEnter={(e) => handleAppointmentHover(apt, e)}
                              onMouseLeave={handleAppointmentLeave}
                            >
                              {formatTime(apt.start)} {apt.client}
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">+{dayAppointments.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
            <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-white rounded-md">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => navigateDate('next')} className="p-2 hover:bg-white rounded-md">
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
                  viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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

      {/* Error message */}
      {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
        <p className="text-red-700">{error}</p>
      </div>
      )}

      {/* Loading state & Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'month' && renderMonthView()}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-600">Barbers:</span>
          {barbers.filter(b => b.id !== 'all').map(barber => (
            <div key={barber.id} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: barber.color }}></div>
              <span className="text-gray-700">{barber.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAppointment ? (
              /* View/Cancel Existing Appointment */
              <>
                <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                      <p className="text-gray-900">{selectedAppointment.client}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                      <p className="text-gray-900">{selectedAppointment.service}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
                      <p className="text-gray-900">{selectedAppointment.barber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">{selectedAppointment.start.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <p className="text-gray-900">
                        {formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}
                      </p>
                    </div>
                  </div>
                  {selectedAppointment.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                  )}
                  {selectedAppointment.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedAppointment.email}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => { setShowAppointmentModal(false); setSelectedAppointment(null); }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                </div>
              </>
            ) : selectedSlot ? (
              /* Create New Appointment */
              <>
                <h2 className="text-xl font-semibold mb-4">Create New Appointment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selected Time</label>
                    <p className="text-gray-900">
                      {selectedSlot.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime(selectedSlot.time)}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Appointment creation form will be implemented here
                  </p>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => { setShowAppointmentModal(false); setSelectedSlot(null); }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Appointment
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment with {selectedAppointment?.client}?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

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
            {(hoveredAppointment.phone || hoveredAppointment.email) && (
              <div className="border-t border-gray-100 pt-2 space-y-2">
                {hoveredAppointment.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.phone}</span>
                  </div>
                )}
                {hoveredAppointment.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{hoveredAppointment.email}</span>
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
