import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { 
  Building, 
  Users, 
  Clock, 
  Settings, 
  Scissors, 
  UserCheck, 
  Phone, 
  Calendar, 
  Shield, 
  Globe,
  CheckCircle,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Import all step components
import Step1BusinessBasics from './Step1BusinessBasics';
import Step2Contacts from './Step2Contacts';
import Step3Hours from './Step3Hours';
import Step4BookingRules from './Step4BookingRules';
import Step5Services from './Step5Services';
import Step6Staff from './Step6Staff';
import Step7PhoneRouting from './Step7PhoneRouting';
import Step8Calendar from './Step8Calendar';
import Step9ConsentTemplates from './Step9ConsentTemplates';
import Step10WebsiteGoLive from './Step10WebsiteGoLive';

const OnboardingWizard = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFinalReview, setShowFinalReview] = useState(false);
  const { user } = useAuth();

  const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;

  const steps = [
    { id: 1, title: 'Business Basics', icon: Building, component: Step1BusinessBasics },
    { id: 2, title: 'Contacts', icon: Users, component: Step2Contacts },
    { id: 3, title: 'Hours', icon: Clock, component: Step3Hours },
    { id: 4, title: 'Booking Rules', icon: Settings, component: Step4BookingRules },
    { id: 5, title: 'Services', icon: Scissors, component: Step5Services },
    { id: 6, title: 'Staff', icon: UserCheck, component: Step6Staff },
    { id: 7, title: 'Phone Routing', icon: Phone, component: Step7PhoneRouting },
    { id: 8, title: 'Calendar', icon: Calendar, component: Step8Calendar },
    { id: 9, title: 'Consent & Templates', icon: Shield, component: Step9ConsentTemplates },
    { id: 10, title: 'Website & Go-Live', icon: Globe, component: Step10WebsiteGoLive }
  ];

  // Load existing draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const response = await fetch(`${API_URL}/onboarding/draft`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const draft = await response.json();
        setFormData(draft.data || {});
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.log('No existing draft found');
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const draftData = {
        ...formData,
        plan: formData.plan || {
          tier: "Starter",
          setupFeeApproved: false,
          monthly: 0
        },
        status: 'draft'
      };

      const response = await fetch(`${API_URL}/onboarding/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(draftData)
      });

      if (response.ok) {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved successfully.",
        });
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStepUpdate = (updatedData) => {
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalReview(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProvision = async () => {
    setLoading(true);
    try {
      const finalData = {
        ...formData,
        plan: formData.plan || {
          tier: "Starter",
          setupFeeApproved: false,
          monthly: 0
        },
        status: 'provisioned'
      };

      const response = await fetch(`${API_URL}/onboarding/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "✅ Tenant Successfully Created!",
          description: `Barbershop "${result?.tenant?.legalName || 'New Tenant'}" has been created and owner invited via email.`,
        });
        
        // Small delay to ensure toast shows before closing
        setTimeout(() => {
          // Close wizard and refresh data
          if (onComplete) {
            onComplete();
          }
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Provisioning failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Provisioning Failed",
        description: error.message || "Failed to provision your tenant. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runReadinessCheck = () => {
    const issues = [];

    // Check required fields
    if (!formData.tenant?.legalName) issues.push('Business legal name is required');
    if (!formData.tenant?.phone) issues.push('Business phone is required');
    if (!formData.tenant?.email) issues.push('Business email is required');
    if (!formData.contacts?.owner?.name) issues.push('Owner contact is required');
    if (!formData.services || formData.services.length === 0) issues.push('At least one service is required');
    if (!formData.staff || formData.staff.length === 0) issues.push('At least one staff member is required');
    if (!formData.website?.slug) issues.push('Website slug is required');
    if (!formData.goLiveDate) issues.push('Go-live date is required');

    return issues;
  };

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  if (showFinalReview) {
    const readinessIssues = runReadinessCheck();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ready to Go Live!
            </h1>
            <p className="text-gray-600">
              Review your configuration and provision your tenant.
            </p>
          </div>

          {/* Readiness Check */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Readiness Checklist</h2>
            
            {readinessIssues.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center text-red-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Issues Found - Please resolve before provisioning:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-7">
                  {readinessIssues.map((issue, index) => (
                    <li key={index} className="text-red-600">{issue}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowFinalReview(false)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go Back and Fix Issues
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">All requirements met! Ready to provision.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Business Setup</h3>
                    <p className="text-sm text-green-700">✓ Complete</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Services & Staff</h3>
                    <p className="text-sm text-green-700">✓ {formData.services?.length || 0} services, {formData.staff?.length || 0} staff</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Configuration</h3>
                    <p className="text-sm text-green-700">✓ Complete</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Website</h3>
                    <p className="text-sm text-green-700">✓ {formData.website?.publicUrl}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final JSON Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Configuration</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setShowFinalReview(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Edit
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={handleProvision}
                disabled={loading || readinessIssues.length > 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Provisioning...' : 'Provision Tenant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Avella Onboarding</h1>
              <p className="text-sm text-gray-600">Welcome {user?.first_name}! Let's set up your business.</p>
            </div>
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar (Wrapped, no horizontal scroll) */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 py-4">
            {steps.map((step) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`inline-flex items-center rounded-full border px-3 py-2 text-xs sm:text-sm transition-colors ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : isDone
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <div
                    className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isDone
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="whitespace-nowrap">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={formData}
              onUpdate={handleStepUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
