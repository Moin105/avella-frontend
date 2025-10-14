/**
 * Validation utilities for the onboarding wizard
 * Implements the strict validation requirements from README.md
 */

// E.164 phone format validation
export const validateE164Phone = (phone) => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

// Format phone to E.164
export const formatToE164 = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, it's US/Canada
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it has 10 digits, assume US/Canada and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // For other countries, assume it needs country code
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  return null;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// IANA timezone validation
export const validateIANATimezone = (timezone) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
};

// Common timezone mappings for user-friendly names
export const TIMEZONE_MAPPINGS = {
  'Pakistan Standard Time': 'Asia/Karachi',
  'Eastern Time': 'America/New_York',
  'Central Time': 'America/Chicago',
  'Mountain Time': 'America/Denver',
  'Pacific Time': 'America/Los_Angeles',
  'GMT': 'Europe/London',
  'IST': 'Asia/Kolkata',
  'JST': 'Asia/Tokyo',
  'AEST': 'Australia/Sydney'
};

// Get IANA timezone from user input
export const getIANATimezone = (input) => {
  // If it's already a valid IANA timezone, return it
  if (validateIANATimezone(input)) {
    return input;
  }
  
  // Check if it's in our mappings
  const mapped = TIMEZONE_MAPPINGS[input];
  if (mapped && validateIANATimezone(mapped)) {
    return mapped;
  }
  
  return null;
};

// Date validation - not earlier than today
export const validateGoLiveDate = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return inputDate >= today;
};

// Duration validation (must be positive integer)
export const validateDuration = (duration) => {
  const num = parseInt(duration);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Price validation (must be positive integer in PKR)
export const validatePrice = (price) => {
  const num = parseInt(price);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

// Time format validation (HH:MM)
export const validateTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validate business slug (for website URL)
export const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
};

// Generate booking path from slug
export const generateBookingPath = (slug) => {
  return `/book/${slug}`;
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  E164_PHONE: 'Phone must be in E.164 format (e.g., +92XXXXXXXXXX)',
  EMAIL: 'Please enter a valid email address',
  IANA_TIMEZONE: 'Please enter a valid timezone (e.g., Asia/Karachi)',
  GO_LIVE_DATE: 'Go-live date cannot be earlier than today',
  DURATION: 'Duration must be a positive integer (minutes)',
  PRICE: 'Price must be a non-negative integer (PKR)',
  TIME_FORMAT: 'Time must be in HH:MM format',
  SLUG: 'Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only'
};

// Get validation error message
export const getValidationError = (field, value) => {
  switch (field) {
    case 'phone':
    case 'mobile':
      return validateE164Phone(value) ? null : VALIDATION_MESSAGES.E164_PHONE;
    case 'email':
      return validateEmail(value) ? null : VALIDATION_MESSAGES.EMAIL;
    case 'timezone':
      return validateIANATimezone(value) ? null : VALIDATION_MESSAGES.IANA_TIMEZONE;
    case 'goLiveDate':
      return validateGoLiveDate(value) ? null : VALIDATION_MESSAGES.GO_LIVE_DATE;
    case 'duration':
      return validateDuration(value) ? null : VALIDATION_MESSAGES.DURATION;
    case 'price':
      return validatePrice(value) ? null : VALIDATION_MESSAGES.PRICE;
    case 'time':
      return validateTimeFormat(value) ? null : VALIDATION_MESSAGES.TIME_FORMAT;
    case 'slug':
      return validateSlug(value) ? null : VALIDATION_MESSAGES.SLUG;
    default:
      return null;
  }
};
