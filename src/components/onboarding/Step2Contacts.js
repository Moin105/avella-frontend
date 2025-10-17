import React, { useState } from 'react';
import { User, Mail, Phone, Building, FileText } from 'lucide-react';
import { 
  validateE164Phone, 
  formatToE164, 
  validateEmail, 
  getValidationError 
} from '../../utils/validation';

const Step2Contacts = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    owner: {
      name: data?.contacts?.owner?.name || '',
      title: data?.contacts?.owner?.title || '',
      email: data?.contacts?.owner?.email || '',
      mobile: data?.contacts?.owner?.mobile || '',
      preferredContact: data?.contacts?.owner?.preferredContact || 'email'
    },
    redirect: {
      name: data?.contacts?.redirect?.name || '',
      title: data?.contacts?.redirect?.title || '',
      email: data?.contacts?.redirect?.email || '',
      phone: data?.contacts?.redirect?.phone || '',
      responsibilities: data?.contacts?.redirect?.responsibilities || []
    },
    billing: {
      name: data?.contacts?.billing?.name || '',
      email: data?.contacts?.billing?.email || '',
      phone: data?.contacts?.billing?.phone || '',
      address: data?.contacts?.billing?.address || ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newResponsibility, setNewResponsibility] = useState('');

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'phone', label: 'Phone Call' }
  ];

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${section}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const handlePhoneBlur = (section, field) => {
    const phone = formData[section][field];
    if (phone && !validateE164Phone(phone)) {
      const formatted = formatToE164(phone);
      if (formatted) {
        handleChange(section, field, formatted);
      }
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        redirect: {
          ...prev.redirect,
          responsibilities: [...prev.redirect.responsibilities, newResponsibility.trim()]
        }
      }));
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      redirect: {
        ...prev.redirect,
        responsibilities: prev.redirect.responsibilities.filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate owner contact
    if (!formData.owner.name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    }
    if (!formData.owner.title.trim()) {
      newErrors.owner_title = 'Owner title is required';
    }
    if (!formData.owner.email.trim()) {
      newErrors.owner_email = 'Owner email is required';
    } else {
      const emailError = getValidationError('email', formData.owner.email);
      if (emailError) {
        newErrors.owner_email = emailError;
      }
    }
    if (!formData.owner.mobile.trim()) {
      newErrors.owner_mobile = 'Owner mobile is required';
    } else {
      const phoneError = getValidationError('phone', formData.owner.mobile);
      if (phoneError) {
        newErrors.owner_mobile = phoneError;
      }
    }

    // Validate redirect contact
    if (!formData.redirect.name.trim()) {
      newErrors.redirect_name = 'Manager name is required';
    }
    if (!formData.redirect.title.trim()) {
      newErrors.redirect_title = 'Manager title is required';
    }
    if (!formData.redirect.email.trim()) {
      newErrors.redirect_email = 'Manager email is required';
    } else {
      const emailError = getValidationError('email', formData.redirect.email);
      if (emailError) {
        newErrors.redirect_email = emailError;
      }
    }
    if (!formData.redirect.phone.trim()) {
      newErrors.redirect_phone = 'Manager phone is required';
    } else {
      const phoneError = getValidationError('phone', formData.redirect.phone);
      if (phoneError) {
        newErrors.redirect_phone = phoneError;
      }
    }

    // Validate billing contact
    if (!formData.billing.name.trim()) {
      newErrors.billing_name = 'Billing contact name is required';
    }
    if (!formData.billing.email.trim()) {
      newErrors.billing_email = 'Billing email is required';
    } else {
      const emailError = getValidationError('email', formData.billing.email);
      if (emailError) {
        newErrors.billing_email = emailError;
      }
    }
    if (!formData.billing.phone.trim()) {
      newErrors.billing_phone = 'Billing phone is required';
    } else {
      const phoneError = getValidationError('phone', formData.billing.phone);
      if (phoneError) {
        newErrors.billing_phone = phoneError;
      }
    }
    if (!formData.billing.address.trim()) {
      newErrors.billing_address = 'Billing address is required';
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
      // Update parent component with form data
      const updatedData = {
        ...data,
        contacts: formData
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 2:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600">
          Set up your key contacts for different business functions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Owner Contact */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Owner Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="owner_name"
                type="text"
                value={formData.owner.name}
                onChange={(e) => handleChange('owner', 'name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.owner_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.owner_name && (
                <p className="mt-1 text-sm text-red-600">{errors.owner_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="owner_title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="owner_title"
                type="text"
                value={formData.owner.title}
                onChange={(e) => handleChange('owner', 'title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.owner_title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Owner/Manager"
              />
              {errors.owner_title && (
                <p className="mt-1 text-sm text-red-600">{errors.owner_title}</p>
              )}
            </div>

            <div>
              <label htmlFor="owner_email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                id="owner_email"
                type="email"
                value={formData.owner.email}
                onChange={(e) => handleChange('owner', 'email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.owner_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@elitehair.com"
              />
              {errors.owner_email && (
                <p className="mt-1 text-sm text-red-600">{errors.owner_email}</p>
              )}
            </div>

            <div>
              <label htmlFor="owner_mobile" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Mobile *
              </label>
              <input
                id="owner_mobile"
                type="tel"
                value={formData.owner.mobile}
                onChange={(e) => handleChange('owner', 'mobile', e.target.value)}
                onBlur={() => handlePhoneBlur('owner', 'mobile')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.owner_mobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1XXXXXXXXXX"
              />
              {errors.owner_mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.owner_mobile}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="owner_preferred" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <select
                id="owner_preferred"
                value={formData.owner.preferredContact}
                onChange={(e) => handleChange('owner', 'preferredContact', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contactMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Manager/Redirect Contact */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-green-600" />
            Manager/Redirect Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="redirect_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="redirect_name"
                type="text"
                value={formData.redirect.name}
                onChange={(e) => handleChange('redirect', 'name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.redirect_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jane Smith"
              />
              {errors.redirect_name && (
                <p className="mt-1 text-sm text-red-600">{errors.redirect_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="redirect_title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="redirect_title"
                type="text"
                value={formData.redirect.title}
                onChange={(e) => handleChange('redirect', 'title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.redirect_title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Operations Manager"
              />
              {errors.redirect_title && (
                <p className="mt-1 text-sm text-red-600">{errors.redirect_title}</p>
              )}
            </div>

            <div>
              <label htmlFor="redirect_email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                id="redirect_email"
                type="email"
                value={formData.redirect.email}
                onChange={(e) => handleChange('redirect', 'email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.redirect_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="jane@elitehair.com"
              />
              {errors.redirect_email && (
                <p className="mt-1 text-sm text-red-600">{errors.redirect_email}</p>
              )}
            </div>

            <div>
              <label htmlFor="redirect_phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone *
              </label>
              <input
                id="redirect_phone"
                type="tel"
                value={formData.redirect.phone}
                onChange={(e) => handleChange('redirect', 'phone', e.target.value)}
                onBlur={() => handlePhoneBlur('redirect', 'phone')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.redirect_phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1XXXXXXXXXX"
              />
              {errors.redirect_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.redirect_phone}</p>
              )}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Responsibilities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add responsibility (e.g., Customer Service)"
              />
              <button
                type="button"
                onClick={addResponsibility}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.redirect.responsibilities.map((resp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {resp}
                  <button
                    type="button"
                    onClick={() => removeResponsibility(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Contact */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-600" />
            Billing Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billing_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="billing_name"
                type="text"
                value={formData.billing.name}
                onChange={(e) => handleChange('billing', 'name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billing_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Billing Manager"
              />
              {errors.billing_name && (
                <p className="mt-1 text-sm text-red-600">{errors.billing_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing_email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                id="billing_email"
                type="email"
                value={formData.billing.email}
                onChange={(e) => handleChange('billing', 'email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billing_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="billing@elitehair.com"
              />
              {errors.billing_email && (
                <p className="mt-1 text-sm text-red-600">{errors.billing_email}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing_phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone *
              </label>
              <input
                id="billing_phone"
                type="tel"
                value={formData.billing.phone}
                onChange={(e) => handleChange('billing', 'phone', e.target.value)}
                onBlur={() => handlePhoneBlur('billing', 'phone')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billing_phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1XXXXXXXXXX"
              />
              {errors.billing_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.billing_phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700 mb-2">
                Billing Address *
              </label>
              <textarea
                id="billing_address"
                value={formData.billing.address}
                onChange={(e) => handleChange('billing', 'address', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billing_address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Full billing address"
              />
              {errors.billing_address && (
                <p className="mt-1 text-sm text-red-600">{errors.billing_address}</p>
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
            {loading ? 'Saving...' : 'Next: Hours'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Contacts;
