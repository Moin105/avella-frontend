import React, { useState } from 'react';
import { Clock, Calendar, AlertTriangle, Shield } from 'lucide-react';
import { validateTimeFormat, getValidationError } from '../../utils/validation';

const Step4BookingRules = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    rules: data?.rules || {
      minLeadHours: 2,
      maxLeadDays: 60,
      sameDay: true,
      sameDayCutoff: '16:00',
      cancelWindowHours: 24,
      noShowPolicy: {
        type: 'none',
        value: 0
      }
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const noShowPolicyTypes = [
    { value: 'none', label: 'No Action', description: 'No penalty for no-shows' },
    { value: 'fee', label: 'Charge Fee', description: 'Charge a fee for no-shows' },
    { value: 'block', label: 'Block Customer', description: 'Block customer from future bookings' }
  ];

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
    '22:00', '22:30', '23:00', '23:30'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: value
      }
    }));

    // Clear error when user changes value
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNoShowPolicyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        noShowPolicy: {
          ...prev.rules.noShowPolicy,
          [field]: value
        }
      }
    }));

    // Clear error when user changes value
    if (errors[`noShowPolicy_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`noShowPolicy_${field}`]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate minLeadHours
    if (formData.rules.minLeadHours < 0 || formData.rules.minLeadHours > 168) {
      newErrors.minLeadHours = 'Minimum lead time must be between 0 and 168 hours (7 days)';
    }

    // Validate maxLeadDays
    if (formData.rules.maxLeadDays < 1 || formData.rules.maxLeadDays > 365) {
      newErrors.maxLeadDays = 'Maximum advance booking must be between 1 and 365 days';
    }

    // Validate sameDayCutoff if sameDay is enabled
    if (formData.rules.sameDay) {
      if (!formData.rules.sameDayCutoff) {
        newErrors.sameDayCutoff = 'Same day cutoff time is required when same day booking is enabled';
      } else {
        const timeError = getValidationError('time', formData.rules.sameDayCutoff);
        if (timeError) {
          newErrors.sameDayCutoff = timeError;
        }
      }
    }

    // Validate cancelWindowHours
    if (formData.rules.cancelWindowHours < 0 || formData.rules.cancelWindowHours > 168) {
      newErrors.cancelWindowHours = 'Cancellation window must be between 0 and 168 hours (7 days)';
    }

    // Validate noShowPolicy value
    if (formData.rules.noShowPolicy.type === 'fee' || formData.rules.noShowPolicy.type === 'block') {
      if (!formData.rules.noShowPolicy.value || formData.rules.noShowPolicy.value < 0) {
        newErrors.noShowPolicy_value = 'Policy value is required and must be non-negative';
      }
    }

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
        rules: formData.rules
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 4:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Rules
        </h2>
        <p className="text-gray-600">
          Configure your booking policies and rules for appointment scheduling.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Lead Time Rules */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Lead Time Rules
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minLeadHours" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Lead Time (Hours) *
              </label>
              <input
                id="minLeadHours"
                type="number"
                min="0"
                max="168"
                value={formData.rules.minLeadHours}
                onChange={(e) => handleChange('minLeadHours', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minLeadHours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2"
              />
              {errors.minLeadHours && (
                <p className="mt-1 text-sm text-red-600">{errors.minLeadHours}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                How many hours in advance must customers book? (0-168 hours)
              </p>
            </div>

            <div>
              <label htmlFor="maxLeadDays" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Advance Booking (Days) *
              </label>
              <input
                id="maxLeadDays"
                type="number"
                min="1"
                max="365"
                value={formData.rules.maxLeadDays}
                onChange={(e) => handleChange('maxLeadDays', parseInt(e.target.value) || 1)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maxLeadDays ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="60"
              />
              {errors.maxLeadDays && (
                <p className="mt-1 text-sm text-red-600">{errors.maxLeadDays}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                How many days in advance can customers book? (1-365 days)
              </p>
            </div>
          </div>
        </div>

        {/* Same Day Booking */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Same Day Booking
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="sameDay"
                type="checkbox"
                checked={formData.rules.sameDay}
                onChange={(e) => handleChange('sameDay', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sameDay" className="ml-2 block text-sm text-gray-900">
                Allow same day bookings
              </label>
            </div>

            {formData.rules.sameDay && (
              <div>
                <label htmlFor="sameDayCutoff" className="block text-sm font-medium text-gray-700 mb-2">
                  Same Day Cutoff Time *
                </label>
                <select
                  id="sameDayCutoff"
                  value={formData.rules.sameDayCutoff || ''}
                  onChange={(e) => handleChange('sameDayCutoff', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sameDayCutoff ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select cutoff time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.sameDayCutoff && (
                  <p className="mt-1 text-sm text-red-600">{errors.sameDayCutoff}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  After this time, same day bookings will not be allowed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Cancellation Policy
          </h3>
          
          <div>
            <label htmlFor="cancelWindowHours" className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Window (Hours) *
            </label>
            <input
              id="cancelWindowHours"
              type="number"
              min="0"
              max="168"
              value={formData.rules.cancelWindowHours}
              onChange={(e) => handleChange('cancelWindowHours', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cancelWindowHours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="24"
            />
            {errors.cancelWindowHours && (
              <p className="mt-1 text-sm text-red-600">{errors.cancelWindowHours}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              How many hours before the appointment can customers cancel? (0-168 hours)
            </p>
          </div>
        </div>

        {/* No-Show Policy */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            No-Show Policy
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No-Show Action *
              </label>
              <div className="space-y-2">
                {noShowPolicyTypes.map(policy => (
                  <div key={policy.value} className="flex items-start">
                    <input
                      id={`policy_${policy.value}`}
                      type="radio"
                      name="noShowPolicyType"
                      value={policy.value}
                      checked={formData.rules.noShowPolicy.type === policy.value}
                      onChange={(e) => handleNoShowPolicyChange('type', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                    />
                    <label htmlFor={`policy_${policy.value}`} className="ml-3 block text-sm">
                      <span className="font-medium text-gray-900">{policy.label}</span>
                      <span className="text-gray-500 block">{policy.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {(formData.rules.noShowPolicy.type === 'fee' || formData.rules.noShowPolicy.type === 'block') && (
              <div>
                <label htmlFor="noShowValue" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.rules.noShowPolicy.type === 'fee' ? 'Fee Amount (USD)' : 'Block Duration (Days)'} *
                </label>
                <input
                  id="noShowValue"
                  type="number"
                  min="0"
                  value={formData.rules.noShowPolicy.value || ''}
                  onChange={(e) => handleNoShowPolicyChange('value', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.noShowPolicy_value ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.rules.noShowPolicy.type === 'fee' ? '500' : '7'}
                />
                {errors.noShowPolicy_value && (
                  <p className="mt-1 text-sm text-red-600">{errors.noShowPolicy_value}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.rules.noShowPolicy.type === 'fee' 
                    ? 'Amount to charge for no-shows (in USD)'
                    : 'How many days to block the customer'
                  }
                </p>
              </div>
            )}
          </div>
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
            {loading ? 'Saving...' : 'Next: Services'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Booking Rules Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Minimum Lead Time:</strong> {formData.rules.minLeadHours} hours</p>
          <p><strong>Maximum Advance Booking:</strong> {formData.rules.maxLeadDays} days</p>
          <p><strong>Same Day Booking:</strong> {formData.rules.sameDay ? 'Enabled' : 'Disabled'}</p>
          {formData.rules.sameDay && (
            <p><strong>Same Day Cutoff:</strong> {formData.rules.sameDayCutoff}</p>
          )}
          <p><strong>Cancellation Window:</strong> {formData.rules.cancelWindowHours} hours</p>
          <p><strong>No-Show Policy:</strong> {formData.rules.noShowPolicy.type}</p>
          {(formData.rules.noShowPolicy.type === 'fee' || formData.rules.noShowPolicy.type === 'block') && (
            <p><strong>Policy Value:</strong> {formData.rules.noShowPolicy.value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4BookingRules;
