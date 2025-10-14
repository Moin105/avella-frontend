import React, { useState } from 'react';
import { Calendar, ExternalLink, Users, CheckCircle, AlertCircle } from 'lucide-react';

const Step8Calendar = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    calendar: data?.calendar || {
      provider: 'none',
      staffToConnect: []
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const calendarProviders = [
    { 
      value: 'none', 
      label: 'No Calendar Integration', 
      description: 'Use Avella\'s built-in calendar system only',
      icon: Calendar,
      color: 'gray'
    },
    { 
      value: 'google', 
      label: 'Google Calendar', 
      description: 'Sync with Google Calendar for staff members',
      icon: Calendar,
      color: 'blue'
    },
    { 
      value: 'microsoft', 
      label: 'Microsoft Outlook', 
      description: 'Sync with Microsoft Outlook/Office 365',
      icon: Calendar,
      color: 'blue'
    },
    { 
      value: 'avella', 
      label: 'Avella Calendar', 
      description: 'Use Avella\'s advanced calendar features',
      icon: Calendar,
      color: 'green'
    }
  ];

  const availableStaff = data?.staff || [];

  const handleProviderChange = (provider) => {
    setFormData(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        provider,
        staffToConnect: provider === 'none' ? [] : prev.calendar.staffToConnect
      }
    }));

    // Clear errors
    if (errors.provider) {
      setErrors(prev => ({
        ...prev,
        provider: null
      }));
    }
  };

  const handleStaffToggle = (staffEmail) => {
    setFormData(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        staffToConnect: prev.calendar.staffToConnect.includes(staffEmail)
          ? prev.calendar.staffToConnect.filter(email => email !== staffEmail)
          : [...prev.calendar.staffToConnect, staffEmail]
      }
    }));
  };

  const generateOAuthLink = (provider, staffEmail) => {
    const baseUrl = window.location.origin;
    const tenantId = 'DRAFT_ID'; // This would be the actual draft ID in real implementation
    return `${baseUrl}/api/oauth/calendar/${provider}/start?tenantId=${tenantId}&staffEmail=${encodeURIComponent(staffEmail)}`;
  };

  const validateForm = () => {
    const newErrors = {};

    // If Google or Microsoft is selected, at least one staff member should be selected
    if ((formData.calendar.provider === 'google' || formData.calendar.provider === 'microsoft') && 
        formData.calendar.staffToConnect.length === 0) {
      newErrors.staffToConnect = 'At least one staff member must be selected for calendar integration';
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
        calendar: formData.calendar
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 8:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Calendar Integration
        </h2>
        <p className="text-gray-600">
          Choose how you want to manage your calendar and appointments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Calendar Provider Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Calendar Provider
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarProviders.map(provider => (
              <div key={provider.value} className="relative">
                <input
                  id={`provider_${provider.value}`}
                  type="radio"
                  name="calendarProvider"
                  value={provider.value}
                  checked={formData.calendar.provider === provider.value}
                  onChange={() => handleProviderChange(provider.value)}
                  className="sr-only"
                />
                <label
                  htmlFor={`provider_${provider.value}`}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.calendar.provider === provider.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <provider.icon className={`h-6 w-6 mr-3 mt-1 ${
                      provider.color === 'blue' ? 'text-blue-600' :
                      provider.color === 'green' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{provider.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                    </div>
                    {formData.calendar.provider === provider.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Selection for Calendar Integration */}
        {(formData.calendar.provider === 'google' || formData.calendar.provider === 'microsoft') && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Staff Calendar Integration
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Select which staff members should have their calendars synced with {formData.calendar.provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'}.
            </p>

            {availableStaff.length > 0 ? (
              <div className="space-y-3">
                {availableStaff.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <input
                        id={`staff_${index}`}
                        type="checkbox"
                        checked={formData.calendar.staffToConnect.includes(staff.email)}
                        onChange={() => handleStaffToggle(staff.email)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`staff_${index}`} className="ml-3 block">
                        <span className="font-medium text-gray-900">{staff.name}</span>
                        <span className="text-sm text-gray-500 block">{staff.email}</span>
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">{staff.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No staff members available. Please add staff members in the previous step.</p>
              </div>
            )}

            {errors.staffToConnect && (
              <p className="mt-2 text-sm text-red-600">{errors.staffToConnect}</p>
            )}
          </div>
        )}

        {/* OAuth Information */}
        {(formData.calendar.provider === 'google' || formData.calendar.provider === 'microsoft') && 
         formData.calendar.staffToConnect.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Calendar Setup Required
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                After provisioning your tenant, you'll need to connect each staff member's calendar:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {formData.calendar.staffToConnect.map((staffEmail, index) => {
                  const staff = availableStaff.find(s => s.email === staffEmail);
                  return (
                    <li key={index}>
                      <strong>{staff?.name || staffEmail}:</strong> Click the OAuth link to connect their {formData.calendar.provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 p-3 bg-blue-100 rounded border">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> OAuth links will be provided after tenant provisioning. 
                  Each staff member will need to authorize calendar access individually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Calendar Integration Benefits</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Google/Microsoft:</strong> Sync with existing calendars, avoid double-booking</p>
            <p>• <strong>Avella Calendar:</strong> Advanced features, team scheduling, automated reminders</p>
            <p>• <strong>No Integration:</strong> Simple calendar management within Avella only</p>
            <p>• <strong>Staff Sync:</strong> Each staff member can connect their personal calendar</p>
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
            {loading ? 'Saving...' : 'Next: Consent & Templates'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Calendar Integration Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Provider:</strong> {calendarProviders.find(p => p.value === formData.calendar.provider)?.label || 'Not set'}</p>
          {formData.calendar.staffToConnect.length > 0 && (
            <p><strong>Staff to Connect:</strong> {formData.calendar.staffToConnect.length} member(s)</p>
          )}
          {formData.calendar.provider === 'none' && (
            <p><strong>Note:</strong> Using Avella's built-in calendar system</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step8Calendar;
