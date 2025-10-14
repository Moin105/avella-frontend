import React, { useState } from 'react';
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { validateTimeFormat, getValidationError } from '../../utils/validation';

const Step3Hours = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    hours: data?.hours || [
      { day: 'Mon', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Tue', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Wed', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Thu', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Fri', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Sat', isOpen: true, open: '09:00', close: '18:00' },
      { day: 'Sun', isOpen: false, open: null, close: null }
    ]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
    '22:00', '22:30', '23:00', '23:30'
  ];

  const handleDayToggle = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.map((hour, index) => 
        index === dayIndex 
          ? { 
              ...hour, 
              isOpen: !hour.isOpen,
              open: !hour.isOpen ? '09:00' : null,
              close: !hour.isOpen ? '18:00' : null
            }
          : hour
      )
    }));

    // Clear errors for this day
    const errorKey = `day_${dayIndex}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.map((hour, index) => 
        index === dayIndex 
          ? { ...hour, [field]: value }
          : hour
      )
    }));

    // Clear error when user changes time
    const errorKey = `day_${dayIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const setAllDays = (isOpen, openTime, closeTime) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.map(hour => ({
        ...hour,
        isOpen,
        open: isOpen ? openTime : null,
        close: isOpen ? closeTime : null
      }))
    }));

    // Clear all day errors
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    formData.hours.forEach((hour, index) => {
      if (hour.isOpen) {
        if (!hour.open) {
          newErrors[`day_${index}_open`] = 'Open time is required';
        } else {
          const timeError = getValidationError('time', hour.open);
          if (timeError) {
            newErrors[`day_${index}_open`] = timeError;
          }
        }

        if (!hour.close) {
          newErrors[`day_${index}_close`] = 'Close time is required';
        } else {
          const timeError = getValidationError('time', hour.close);
          if (timeError) {
            newErrors[`day_${index}_close`] = timeError;
          }
        }

        // Validate that close time is after open time
        if (hour.open && hour.close && hour.open >= hour.close) {
          newErrors[`day_${index}_close`] = 'Close time must be after open time';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedData = {
        ...data,
        hours: formData.hours
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 3:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Operating Hours
        </h2>
        <p className="text-gray-600">
          Set your business hours for each day of the week. These will be used for appointment scheduling.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAllDays(true, '09:00', '18:00')}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set All 9 AM - 6 PM
            </button>
            <button
              type="button"
              onClick={() => setAllDays(true, '10:00', '19:00')}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set All 10 AM - 7 PM
            </button>
            <button
              type="button"
              onClick={() => setAllDays(false, null, null)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close All
            </button>
          </div>
        </div>

        {/* Hours for each day */}
        <div className="space-y-4">
          {formData.hours.map((hour, index) => (
            <div key={hour.day} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 mr-4">
                    {hour.day}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDayToggle(index)}
                    className="flex items-center text-sm font-medium"
                  >
                    {hour.isOpen ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600">Open</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-500">Closed</span>
                      </>
                    )}
                  </button>
                </div>

                {hour.isOpen && (
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open
                      </label>
                      <select
                        value={hour.open || ''}
                        onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`day_${index}_open`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors[`day_${index}_open`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`day_${index}_open`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Close
                      </label>
                      <select
                        value={hour.close || ''}
                        onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`day_${index}_close`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors[`day_${index}_close`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`day_${index}_close`]}</p>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 mt-6">
                      {hour.open && hour.close && (
                        <span>
                          {hour.open} - {hour.close}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Next: Booking Rules'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Operating Hours Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {formData.hours.map((hour, index) => (
            <div key={hour.day} className="flex justify-between">
              <span className="font-medium">{hour.day}:</span>
              <span>
                {hour.isOpen 
                  ? `${hour.open} - ${hour.close}` 
                  : 'Closed'
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3Hours;
