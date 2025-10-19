import React, { useState } from 'react';
import { Globe, Calendar, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { validateSlug, generateBookingPath, validateGoLiveDate, getValidationError, cleanSlug } from '../../utils/validation';

const Step10WebsiteGoLive = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    website: data?.website || {
      slug: '',
      bookingPath: '',
      publicUrl: ''
    },
    goLiveDate: data?.goLiveDate || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSlugChange = (slug) => {
    // Automatically convert to lowercase and clean the slug
    const cleanedSlug = cleanSlug(slug);
    
    const bookingPath = generateBookingPath(cleanedSlug);
    const publicUrl = cleanedSlug ? `https://app.avellabooking.com/book/${cleanedSlug}` : '';
    
    setFormData(prev => ({
      ...prev,
      website: {
        ...prev.website,
        slug: cleanedSlug,
        bookingPath,
        publicUrl
      }
    }));

    // Clear error when user changes slug
    if (errors.slug) {
      setErrors(prev => ({
        ...prev,
        slug: null
      }));
    }
  };

  const handleGoLiveDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      goLiveDate: date
    }));

    // Clear error when user changes date
    if (errors.goLiveDate) {
      setErrors(prev => ({
        ...prev,
        goLiveDate: null
      }));
    }
  };

  const generateSlugFromBusinessName = () => {
    const businessName = data?.tenant?.legalName || data?.tenant?.brandName || '';
    if (businessName) {
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      handleSlugChange(slug);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate slug
    if (!formData.website.slug.trim()) {
      newErrors.slug = 'Website slug is required';
    } else {
      const slugError = getValidationError('slug', formData.website.slug);
      if (slugError) {
        newErrors.slug = slugError;
      }
    }

    // Validate go-live date
    if (!formData.goLiveDate.trim()) {
      newErrors.goLiveDate = 'Go-live date is required';
    } else {
      const dateError = getValidationError('goLiveDate', formData.goLiveDate);
      if (dateError) {
        newErrors.goLiveDate = dateError;
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
        website: formData.website,
        goLiveDate: formData.goLiveDate
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 10:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Website & Go-Live
        </h2>
        <p className="text-gray-600">
          Set up your public booking website and choose when to go live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Website Configuration */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Website Configuration
          </h3>
          
          <div className="space-y-6">
            {/* Website Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Website Slug *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    id="slug"
                    type="text"
                    value={formData.website.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="elite-hair-studio"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateSlugFromBusinessName}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  Auto-generate
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be your unique booking URL. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Generated URLs */}
            {formData.website.slug && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Generated URLs:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 w-24">Booking Path:</span>
                    <code className="bg-white px-2 py-1 rounded border text-blue-600">
                      {formData.website.bookingPath}
                    </code>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-24">Public URL:</span>
                    <code className="bg-white px-2 py-1 rounded border text-blue-600">
                      {formData.website.publicUrl}
                    </code>
                    <a
                      href={formData.website.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Go-Live Date */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Go-Live Date
          </h3>
          
          <div>
            <label htmlFor="goLiveDate" className="block text-sm font-medium text-gray-700 mb-2">
              When do you want to go live? *
            </label>
            <input
              id="goLiveDate"
              type="date"
              value={formData.goLiveDate}
              onChange={(e) => handleGoLiveDateChange(e.target.value)}
              min={getMinDate()}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.goLiveDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.goLiveDate && (
              <p className="mt-1 text-sm text-red-600">{errors.goLiveDate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Choose when you want your booking system to be publicly available. Cannot be earlier than today.
            </p>
          </div>
        </div>

        {/* Pre-Launch Checklist */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Pre-Launch Checklist
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Business information configured</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Contact information set up</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Operating hours configured</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Booking rules established</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Services and staff added</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Phone routing configured</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Calendar integration set up</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Consent and templates configured</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
              <span>Website URL and go-live date set</span>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Important Notes
          </h4>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>Website URL:</strong> Once set, the website slug cannot be changed easily. 
              Choose carefully as this will be your permanent booking URL.
            </p>
            <p>
              <strong>Go-Live Date:</strong> Your booking system will be publicly accessible starting 
              from this date. Make sure you're ready to handle bookings.
            </p>
            <p>
              <strong>Testing:</strong> You can test your booking system before the go-live date 
              using the admin dashboard.
            </p>
            <p>
              <strong>Support:</strong> Our team will be available to help you with the launch 
              and any questions you may have.
            </p>
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
            {loading ? 'Saving...' : 'Review & Provision'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Website & Go-Live Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Website Slug:</strong> {formData.website.slug || 'Not set'}</p>
          <p><strong>Booking Path:</strong> {formData.website.bookingPath || 'Not set'}</p>
          <p><strong>Public URL:</strong> {formData.website.publicUrl || 'Not set'}</p>
          <p><strong>Go-Live Date:</strong> {formData.goLiveDate || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default Step10WebsiteGoLive;
