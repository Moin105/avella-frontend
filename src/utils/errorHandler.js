/**
 * Utility function to extract error messages from API responses
 * Handles different error response formats from the backend
 * 
 * @param {Error} error - The error object from axios or fetch
 * @param {string} defaultMessage - Default message if no specific error is found
 * @returns {string} - Extracted error message
 */
export const extractErrorMessage = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Handle different types of API errors
  let message = defaultMessage;
  
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Handle specific error formats
    if (errorData.detail) {
      message = errorData.detail;
    } else if (errorData.message) {
      message = errorData.message;
    } else if (errorData.error) {
      message = errorData.error;
    } else if (typeof errorData === 'string') {
      message = errorData;
    }
    
    // Handle validation errors (array of errors)
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        message = errorData.errors.join(', ');
      } else if (typeof errorData.errors === 'object') {
        const errorMessages = Object.values(errorData.errors).flat();
        message = errorMessages.join(', ');
      }
    }
    
    // Handle field-specific validation errors
    if (errorData.validation_errors) {
      const fieldErrors = Object.entries(errorData.validation_errors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      message = fieldErrors;
    }
  } else if (error.message) {
    message = error.message;
  }
  
  return message;
};

/**
 * Handle API errors and return a standardized response
 * 
 * @param {Function} apiCall - The API function to call
 * @param {string} defaultErrorMessage - Default error message
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const handleApiCall = async (apiCall, defaultErrorMessage = 'Operation failed') => {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, defaultErrorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Common error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required'
};

/**
 * Get user-friendly error message based on error type
 * 
 * @param {Error} error - The error object
 * @param {string} context - Context of the error (e.g., 'login', 'register')
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error, context = '') => {
  const status = error.response?.status;
  const errorData = error.response?.data;
  
  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      if (errorData?.detail?.includes('Email already registered')) {
        return ERROR_MESSAGES.EMAIL_EXISTS;
      }
      if (errorData?.detail?.includes('Invalid credentials')) {
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      }
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return extractErrorMessage(error, ERROR_MESSAGES.SERVER_ERROR);
  }
};
