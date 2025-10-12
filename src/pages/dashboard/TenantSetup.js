import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building, 
  Clock, 
  Globe, 
  Phone, 
  MapPin,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const TenantSetup = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'salon',
    address: '',
    phone: '',
    website: '',
    timezone: 'America/New_York'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { createTenant, initializeDefaultServices } = useTenant();
  const { user } = useAuth();

  const businessTypes = [
    { value: 'salon', label: 'Hair Salon' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'spa', label: 'Spa' },
    { value: 'beauty', label: 'Beauty Salon' },
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create tenant
      const result = await createTenant(formData);
      
      if (result.success) {
        setStep(2);
        
        // Step 2: Initialize default services
        const servicesResult = await initializeDefaultServices();
        
        if (servicesResult.success) {
          toast({
            title: "Setup Complete! 🎉",
            description: "Your business is ready to start taking appointments.",
          });
          setStep(3);
        } else {
          toast({
            variant: "destructive",
            title: "Setup Warning",
            description: "Business created but failed to initialize services. You can add them manually.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Setup Failed",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Avella AI! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your business <strong>{formData.business_name}</strong> is now set up with 
              35+ pre-configured services. You're ready to start taking appointments!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              data-testid="continue-to-dashboard-btn"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set up your business
          </h1>
          <p className="text-gray-600">
            Welcome {user?.first_name}! Let's get your appointment booking system ready.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="tenant-setup-form">
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Business Name *
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Elite Hair Studio"
                  data-testid="business-name-input"
                />
              </div>

              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  id="business_type"
                  name="business_type"
                  required
                  value={formData.business_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="business-type-select"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Business Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                    data-testid="phone-input"
                  />
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Timezone *
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    required
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="timezone-select"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Business Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, State 12345"
                  data-testid="address-input"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                  data-testid="website-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="setup-submit-btn"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  'Create Business & Initialize Services'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Setting up your business...
              </h2>
              <p className="text-gray-600">
                We're initializing 35+ services including haircuts, coloring, treatments, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantSetup;