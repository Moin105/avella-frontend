import React, { useState } from 'react';
import { Shield, MessageSquare, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

const Step9ConsentTemplates = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    consent: data?.consent || {
      smsClient: true,
      dataShare: true
    },
    autoInstallTemplates: data?.autoInstallTemplates !== undefined ? data.autoInstallTemplates : true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleConsentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      consent: {
        ...prev.consent,
        [field]: value
      }
    }));
  };

  const handleTemplateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      autoInstallTemplates: value
    }));
  };

  const validateForm = () => {
    // No specific validation needed for this step
    return true;
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
        consent: formData.consent,
        autoInstallTemplates: formData.autoInstallTemplates
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 9:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Consent & Templates
        </h2>
        <p className="text-gray-600">
          Configure your consent preferences and notification templates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Consent Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Consent Settings
          </h3>
          
          <div className="space-y-6">
            {/* SMS Client Consent */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="smsClient"
                  type="checkbox"
                  checked={formData.consent.smsClient}
                  onChange={(e) => handleConsentChange('smsClient', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="smsClient" className="text-sm font-medium text-gray-900">
                  SMS Client Communication
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow sending SMS messages to clients for appointment confirmations, reminders, and updates.
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <p>• Appointment confirmations</p>
                  <p>• Reminder notifications</p>
                  <p>• Rescheduling notifications</p>
                  <p>• Cancellation confirmations</p>
                </div>
              </div>
            </div>

            {/* Data Sharing Consent */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="dataShare"
                  type="checkbox"
                  checked={formData.consent.dataShare}
                  onChange={(e) => handleConsentChange('dataShare', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="dataShare" className="text-sm font-medium text-gray-900">
                  Data Sharing for Service Improvement
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow Avella to use anonymized data to improve services and provide better features.
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <p>• Anonymized usage statistics</p>
                  <p>• Service performance metrics</p>
                  <p>• Feature improvement insights</p>
                  <p>• No personal client data is shared</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Templates */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Notification Templates
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Default Notification Templates
              </label>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="autoInstallYes"
                    type="radio"
                    name="autoInstallTemplates"
                    value={true}
                    checked={formData.autoInstallTemplates === true}
                    onChange={() => handleTemplateChange(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                  />
                  <label htmlFor="autoInstallYes" className="ml-3 block">
                    <span className="font-medium text-gray-900">Yes, install default templates</span>
                    <span className="text-sm text-gray-500 block mt-1">
                      Automatically install pre-configured SMS and email templates for common scenarios.
                    </span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="autoInstallNo"
                    type="radio"
                    name="autoInstallTemplates"
                    value={false}
                    checked={formData.autoInstallTemplates === false}
                    onChange={() => handleTemplateChange(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                  />
                  <label htmlFor="autoInstallNo" className="ml-3 block">
                    <span className="font-medium text-gray-900">No, I'll create my own</span>
                    <span className="text-sm text-gray-500 block mt-1">
                      Start with empty templates and create custom messages for your business.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Template Preview */}
            {formData.autoInstallTemplates && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Default Templates Preview
                </h4>
                <div className="text-sm text-green-800 space-y-2">
                  <div>
                    <strong>Booking Confirmation:</strong>
                    <p className="text-xs text-green-700 mt-1">
                      "Hi {`{customerName}`}! Your {`{service}`} appointment is confirmed for {`{date}`} at {`{time}`}. 
                      See you at {`{businessName}`}! Reply STOP to opt out."
                    </p>
                  </div>
                  <div>
                    <strong>Reminder (24h before):</strong>
                    <p className="text-xs text-green-700 mt-1">
                      "Reminder: You have a {`{service}`} appointment tomorrow at {`{time}`}. 
                      Please arrive 10 minutes early. Reply STOP to opt out."
                    </p>
                  </div>
                  <div>
                    <strong>Rescheduling:</strong>
                    <p className="text-xs text-green-700 mt-1">
                      "Your appointment has been rescheduled to {`{newDate}`} at {`{newTime}`}. 
                      If you need to make changes, please call us. Reply STOP to opt out."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Important Legal Information
          </h4>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>Compliance Notice:</strong> By enabling SMS communication, you agree to comply with 
              local telecommunications regulations and anti-spam laws.
            </p>
            <p>
              <strong>Client Consent:</strong> You are responsible for obtaining proper consent from clients 
              before sending SMS messages. Avella provides tools to manage opt-in/opt-out preferences.
            </p>
            <p>
              <strong>Data Protection:</strong> All client data is protected according to our privacy policy. 
              Data sharing for service improvement is completely anonymized and does not include personal information.
            </p>
            <p>
              <strong>Template Customization:</strong> You can modify all notification templates after setup 
              to match your business voice and requirements.
            </p>
          </div>
        </div>

        {/* Benefits Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Benefits of These Settings</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>SMS Notifications:</strong> Reduce no-shows by 40% with automated reminders</p>
            <p>• <strong>Default Templates:</strong> Professional, compliant messages ready to use</p>
            <p>• <strong>Data Insights:</strong> Help improve Avella's features for all users</p>
            <p>• <strong>Customization:</strong> All settings can be changed after setup</p>
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
            {loading ? 'Saving...' : 'Next: Website & Go-Live'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Consent & Templates Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>SMS Client Communication:</strong> {formData.consent.smsClient ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Data Sharing:</strong> {formData.consent.dataShare ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Default Templates:</strong> {formData.autoInstallTemplates ? 'Will be installed' : 'Will create custom'}</p>
        </div>
      </div>
    </div>
  );
};

export default Step9ConsentTemplates;
