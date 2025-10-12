import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';

// Placeholder for Reset Password Page
const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-blue-600 mr-3" />
            <span className="text-3xl font-bold text-gray-900">Avella AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">
            Reset password functionality coming soon
          </p>
        </div>
        
        <div className="text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;