import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import { 
  validateE164Phone, 
  formatToE164, 
  validateEmail, 
  validateIANATimezone, 
  getIANATimezone,
  getValidationError 
} from '../../utils/validation';

const Step1BusinessBasics = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    legalName: data?.tenant?.legalName || '',
    brandName: data?.tenant?.brandName || '',
    timezone: data?.tenant?.timezone || 'America/New_York',
    phone: data?.tenant?.phone || '',
    email: data?.tenant?.email || '',
    address: {
      city: data?.tenant?.address?.city || '',
      state: data?.tenant?.address?.state || '',
      country: data?.tenant?.address?.country || 'United States'
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Detroit', label: 'Eastern Time - Detroit (ET)' },
    { value: 'America/Indiana/Indianapolis', label: 'Eastern Time - Indianapolis (ET)' },
    { value: 'America/Kentucky/Louisville', label: 'Eastern Time - Louisville (ET)' },
    { value: 'America/Kentucky/Monticello', label: 'Eastern Time - Monticello (ET)' },
    { value: 'America/Indiana/Vincennes', label: 'Eastern Time - Vincennes (ET)' },
    { value: 'America/Indiana/Winamac', label: 'Eastern Time - Winamac (ET)' },
    { value: 'America/Indiana/Marengo', label: 'Eastern Time - Marengo (ET)' },
    { value: 'America/Indiana/Petersburg', label: 'Eastern Time - Petersburg (ET)' },
    { value: 'America/Indiana/Vevay', label: 'Eastern Time - Vevay (ET)' },
    { value: 'America/Chicago', label: 'Central Time - Chicago (CT)' },
    { value: 'America/Indiana/Tell_City', label: 'Central Time - Tell City (CT)' },
    { value: 'America/Indiana/Knox', label: 'Central Time - Knox (CT)' },
    { value: 'America/Menominee', label: 'Central Time - Menominee (CT)' },
    { value: 'America/North_Dakota/Center', label: 'Central Time - Center (CT)' },
    { value: 'America/North_Dakota/New_Salem', label: 'Central Time - New Salem (CT)' },
    { value: 'America/North_Dakota/Beulah', label: 'Central Time - Beulah (CT)' },
    { value: 'America/Denver', label: 'Mountain Time - Denver (MT)' },
    { value: 'America/Boise', label: 'Mountain Time - Boise (MT)' },
    { value: 'America/Phoenix', label: 'Mountain Time - Phoenix (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time - Los Angeles (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time - Anchorage (AKT)' },
    { value: 'America/Juneau', label: 'Alaska Time - Juneau (AKT)' },
    { value: 'America/Sitka', label: 'Alaska Time - Sitka (AKT)' },
    { value: 'America/Metlakatla', label: 'Alaska Time - Metlakatla (AKT)' },
    { value: 'America/Yakutat', label: 'Alaska Time - Yakutat (AKT)' },
    { value: 'America/Nome', label: 'Alaska Time - Nome (AKT)' },
    { value: 'America/Adak', label: 'Hawaii-Aleutian Time - Adak (HAT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time - Honolulu (HST)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.legalName.trim()) {
      newErrors.legalName = 'Legal name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneError = getValidationError('phone', formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailError = getValidationError('email', formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Validate timezone
    const timezoneError = getValidationError('timezone', formData.timezone);
    if (timezoneError) {
      newErrors.timezone = timezoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneBlur = () => {
    if (formData.phone && !validateE164Phone(formData.phone)) {
      const formatted = formatToE164(formData.phone);
      if (formatted) {
        setFormData(prev => ({
          ...prev,
          phone: formatted
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Update parent component with form data
      const updatedData = {
        ...data,
        tenant: {
          ...data?.tenant,
          legalName: formData.legalName,
          brandName: formData.brandName,
          timezone: formData.timezone,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        }
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 1:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Basics
        </h2>
        <p className="text-gray-600">
          Let's start with your business information. This will be used for your booking system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Legal Name */}
        <div>
          <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline h-4 w-4 mr-1" />
            Legal Business Name *
          </label>
          <input
            id="legalName"
            type="text"
            value={formData.legalName}
            onChange={(e) => handleChange('legalName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.legalName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Elite Hair Studio LLC"
          />
          {errors.legalName && (
            <p className="mt-1 text-sm text-red-600">{errors.legalName}</p>
          )}
        </div>

        {/* Brand Name */}
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name (Optional)
          </label>
          <input
            id="brandName"
            type="text"
            value={formData.brandName}
            onChange={(e) => handleChange('brandName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Elite Hair Studio (if different from legal name)"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Business Phone *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={handlePhoneBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1XXXXXXXXXX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: +1XXXXXXXXXX (E.164 format)
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Business Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="info@elitehair.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Timezone *
          </label>
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.timezone ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            <MapPin className="inline h-5 w-5 mr-1" />
            Business Address
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="New York"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                id="state"
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="New York"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                id="country"
                type="text"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="United States"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
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
            {loading ? 'Saving...' : 'Next: Contacts'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Legal Name:</strong> {formData.legalName || 'Not set'}</p>
          {formData.brandName && <p><strong>Brand Name:</strong> {formData.brandName}</p>}
          <p><strong>Phone:</strong> {formData.phone || 'Not set'}</p>
          <p><strong>Email:</strong> {formData.email || 'Not set'}</p>
          <p><strong>Timezone:</strong> {formData.timezone}</p>
          <p><strong>Address:</strong> {formData.address.city}, {formData.address.state}, {formData.address.country}</p>
        </div>
      </div>
    </div>
  );
};

export default Step1BusinessBasics;
