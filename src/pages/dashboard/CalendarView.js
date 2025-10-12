import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Clock,
  User
} from 'lucide-react';

const CalendarView = () => {
  const { currentTenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [appointments, setAppointments] = useState([]);

  // Mock appointment data
  const mockAppointments = [
    {
      id: 1,
      title: "Men's Haircut - Bob Lee",
      start: new Date(2025, 9, 4, 9, 0), // Oct 4, 2025, 9:00 AM
      end: new Date(2025, 9, 4, 9, 30),
      barber: 'David',
      client: 'Bob Lee',
      service: "Men's Haircut",
      status: 'confirmed'
    },
    {
      id: 2,
      title: "Women's Haircut - Ana Ruiz",
      start: new Date(2025, 9, 4, 9, 45),
      end: new Date(2025, 9, 4, 10, 45),
      barber: 'Susan',
      client: 'Ana Ruiz',
      service: "Women's Haircut",
      status: 'confirmed'
    },
    {
      id: 3,
      title: "Men + Beard - Marco S.",
      start: new Date(2025, 9, 4, 10, 0),
      end: new Date(2025, 9, 4, 10, 45),
      barber: 'John',
      client: 'Marco S.',
      service: 'Men + Beard',
      status: 'pending'
    },
    {
      id: 4,
      title: "Men's Haircut - T. Nguyen",
      start: new Date(2025, 9, 4, 11, 15),
      end: new Date(2025, 9, 4, 11, 45),
      barber: 'David',
      client: 'T. Nguyen',
      service: "Men's Haircut",
      status: 'confirmed'
    },
    {
      id: 5,
      title: "Men's Haircut - K. Ortiz",
      start: new Date(2025, 9, 4, 13, 0),
      end: new Date(2025, 9, 4, 13, 30),
      barber: 'David',
      client: 'K. Ortiz',
      service: "Men's Haircut",
      status: 'busy'
    }
  ];

  const barbers = [
    { id: 'all', name: 'All Barbers', color: '#3B82F6' },
    { id: 'david', name: 'David', color: '#10B981' },
    { id: 'susan', name: 'Susan', color: '#F59E0B' },
    { id: 'john', name: 'John', color: '#EF4444' }
  ];

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
    return mockAppointments.filter(apt => {
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
                  if (selectedBarber !== 'all' && appointment.barber.toLowerCase() !== selectedBarber) {
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
                      className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: barber ? barber.color : '#3B82F6',
                        opacity: appointment.status === 'confirmed' ? 1 : 0.7
                      }}
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
    </div>
  );
};

export default CalendarView;