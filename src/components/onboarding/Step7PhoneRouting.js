import React, { useState } from 'react';
import { Phone, PhoneCall, Voicemail, Bot, Forward } from 'lucide-react';
import { validateE164Phone, formatToE164, getValidationError } from '../../utils/validation';

const Step7PhoneRouting = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    phone: data?.phone || {
      currentNumber: '',
      action: 'keep',
      afterHours: 'ai',
      onCallNumber: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const phoneActions = [
    { 
      value: 'keep', 
      label: 'Keep Current Number', 
      description: 'Continue using your existing phone number',
      icon: Phone
    },
    { 
      value: 'port', 
      label: 'Port to Avella', 
      description: 'Transfer your existing number to Avella system',
      icon: PhoneCall
    },
    { 
      value: 'new', 
      label: 'Get New Number', 
      description: 'Get a new phone number from Avella',
      icon: Phone
    }
  ];

  const afterHoursOptions = [
    { 
      value: 'ai', 
      label: 'AI Assistant', 
      description: 'AI will handle calls and take messages',
      icon: Bot
    },
    { 
      value: 'voicemail', 
      label: 'Voicemail', 
      description: 'Calls go directly to voicemail',
      icon: Voicemail
    },
    { 
      value: 'forward', 
      label: 'Forward to Number', 
      description: 'Forward calls to another number',
      icon: Forward
    }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      phone: {
        ...prev.phone,
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

  const handlePhoneBlur = (field) => {
    const phone = formData.phone[field];
    if (phone && !validateE164Phone(phone)) {
      const formatted = formatToE164(phone);
      if (formatted) {
        handleChange(field, formatted);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate current number
    if (!formData.phone.currentNumber.trim()) {
      newErrors.currentNumber = 'Current phone number is required';
    } else {
      const phoneError = getValidationError('phone', formData.phone.currentNumber);
      if (phoneError) {
        newErrors.currentNumber = phoneError;
      }
    }

    // Validate on-call number if afterHours is 'forward'
    if (formData.phone.afterHours === 'forward') {
      if (!formData.phone.onCallNumber.trim()) {
        newErrors.onCallNumber = 'On-call number is required when forwarding calls';
      } else {
        const phoneError = getValidationError('phone', formData.phone.onCallNumber);
        if (phoneError) {
          newErrors.onCallNumber = phoneError;
        }
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
        phone: formData.phone
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 7:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Phone Routing
        </h2>
        <p className="text-gray-600">
          Configure how your phone system will handle incoming calls and after-hours routing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Phone Number */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-blue-600" />
            Current Phone Number
          </h3>
          
          <div>
            <label htmlFor="currentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone Number *
            </label>
            <input
              id="currentNumber"
              type="tel"
              value={formData.phone.currentNumber}
              onChange={(e) => handleChange('currentNumber', e.target.value)}
              onBlur={() => handlePhoneBlur('currentNumber')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1XXXXXXXXXX"
            />
            {errors.currentNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.currentNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This is your current business phone number
            </p>
          </div>
        </div>

        {/* Phone Action */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PhoneCall className="h-5 w-5 mr-2 text-green-600" />
            Phone Number Action
          </h3>
          
          <div className="space-y-3">
            {phoneActions.map(action => (
              <div key={action.value} className="flex items-start">
                <input
                  id={`action_${action.value}`}
                  type="radio"
                  name="phoneAction"
                  value={action.value}
                  checked={formData.phone.action === action.value}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                />
                <label htmlFor={`action_${action.value}`} className="ml-3 block">
                  <div className="flex items-center">
                    <action.icon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                  <span className="text-sm text-gray-500 block mt-1">{action.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* After Hours Routing */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Voicemail className="h-5 w-5 mr-2 text-purple-600" />
            After Hours Routing
          </h3>
          
          <div className="space-y-3">
            {afterHoursOptions.map(option => (
              <div key={option.value} className="flex items-start">
                <input
                  id={`afterHours_${option.value}`}
                  type="radio"
                  name="afterHours"
                  value={option.value}
                  checked={formData.phone.afterHours === option.value}
                  onChange={(e) => handleChange('afterHours', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                />
                <label htmlFor={`afterHours_${option.value}`} className="ml-3 block">
                  <div className="flex items-center">
                    <option.icon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-sm text-gray-500 block mt-1">{option.description}</span>
                </label>
              </div>
            ))}
          </div>

          {/* On-Call Number Input */}
          {formData.phone.afterHours === 'forward' && (
            <div className="mt-4">
              <label htmlFor="onCallNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Forward to Number *
              </label>
              <input
                id="onCallNumber"
                type="tel"
                value={formData.phone.onCallNumber}
                onChange={(e) => handleChange('onCallNumber', e.target.value)}
                onBlur={() => handlePhoneBlur('onCallNumber')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.onCallNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1XXXXXXXXXX"
              />
              {errors.onCallNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.onCallNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Number to forward calls to after hours
              </p>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Phone System Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Keep Current:</strong> Your existing number stays with your current provider</p>
            <p>• <strong>Port to Avella:</strong> Transfer your number to Avella's phone system</p>
            <p>• <strong>New Number:</strong> Get a new Avella phone number for your business</p>
            <p>• <strong>AI Assistant:</strong> Handles calls, takes messages, and can book appointments</p>
            <p>• <strong>After Hours:</strong> These settings apply when your business is closed</p>
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
            {loading ? 'Saving...' : 'Next: Calendar'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Phone Routing Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Current Number:</strong> {formData.phone.currentNumber || 'Not set'}</p>
          <p><strong>Action:</strong> {phoneActions.find(a => a.value === formData.phone.action)?.label || 'Not set'}</p>
          <p><strong>After Hours:</strong> {afterHoursOptions.find(o => o.value === formData.phone.afterHours)?.label || 'Not set'}</p>
          {formData.phone.afterHours === 'forward' && (
            <p><strong>Forward to:</strong> {formData.phone.onCallNumber || 'Not set'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step7PhoneRouting;
