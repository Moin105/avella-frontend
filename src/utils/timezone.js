/**
 * Timezone utility functions for converting UTC times to tenant timezone
 * Uses Luxon for robust timezone handling with fallback to native Date + Intl API
 */

// Try to import Luxon, fallback to native implementation if unavailable
let DateTime;
try {
  // Try both CommonJS and ES6 imports
  const luxon = require('luxon');
  DateTime = luxon.DateTime;
  console.log('Luxon loaded successfully');
} catch (error) {
  console.warn('Luxon not available, using native Date + Intl API fallback:', error.message);
  DateTime = null;
}

/**
 * Convert UTC datetime to tenant timezone using Luxon (preferred) or native Date + Intl
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string (e.g., 'America/New_York')
 * @returns {Object} - { date, time, fullDateTime, timezone, rawDate }
 */
export const convertToTenantTimezone = (utcDateTime, tenantTimezone = 'America/New_York') => {
  try {
    // Force native implementation for now to debug the issue
    console.log('Using native Date + Intl API for timezone conversion');
    console.log('Input:', utcDateTime, 'Timezone:', tenantTimezone);
    
    const result = convertWithNative(utcDateTime, tenantTimezone);
    console.log('Conversion result:', result);
    return result;
    
    // Use Luxon if available (recommended for robust timezone handling)
    // if (DateTime) {
    //   return convertWithLuxon(utcDateTime, tenantTimezone);
    // } else {
    //   // Fallback to native Date + Intl API
    //   return convertWithNative(utcDateTime, tenantTimezone);
    // }
  } catch (error) {
    console.error('Error converting timezone:', error);
    return {
      date: 'Error',
      time: 'Error',
      fullDateTime: 'Error',
      timezone: tenantTimezone,
      rawDate: null
    };
  }
};

/**
 * Convert using Luxon (preferred method)
 */
const convertWithLuxon = (utcDateTime, tenantTimezone) => {
  try {
    // Parse the datetime string - Luxon handles timezone detection automatically
    let dt;
    
    if (typeof utcDateTime === 'string') {
      // If no timezone info, treat as UTC
      if (!utcDateTime.includes('Z') && !utcDateTime.includes('+') && !utcDateTime.includes('-')) {
        dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
      } else {
        dt = DateTime.fromISO(utcDateTime);
      }
    } else {
      dt = DateTime.fromJSDate(utcDateTime);
    }
    
    // Check if datetime is valid
    if (!dt.isValid) {
      console.error('Invalid date provided:', utcDateTime, dt.invalidReason);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        fullDateTime: 'Invalid DateTime',
        timezone: tenantTimezone,
        rawDate: null
      };
    }
    
    // Convert to tenant timezone
    const tenantDt = dt.setZone(tenantTimezone);
    
    // Format date (e.g., "Oct 22, 2025")
    const formattedDate = tenantDt.toFormat('LLL d, yyyy');
    
    // Format time (e.g., "2:00 PM")
    const formattedTime = tenantDt.toFormat('h:mm a');
    
    // Full datetime string
    const fullDateTime = tenantDt.toFormat('LLL d, yyyy h:mm a');
    
    // Debug logging
    console.log('Luxon timezone conversion:', {
      input: utcDateTime,
      utcISO: dt.toISO(),
      tenantISO: tenantDt.toISO(),
      tenantTimezone,
      formattedTime,
      formattedDate,
      utcHour: dt.hour,
      utcMinute: dt.minute,
      tenantHour: tenantDt.hour,
      tenantMinute: tenantDt.minute
    });
    
    return {
      date: formattedDate,
      time: formattedTime,
      fullDateTime: fullDateTime,
      timezone: tenantTimezone,
      rawDate: tenantDt.toJSDate()
    };
  } catch (error) {
    console.error('Luxon conversion error:', error);
    throw error;
  }
};

/**
 * Convert using native Date + Intl API (fallback method)
 */
const convertWithNative = (utcDateTime, tenantTimezone) => {
  try {
    // Robust timezone detection: check for explicit timezone indicators
    // ISO strings without timezone info (e.g., "2025-10-22T18:00:00") are treated as UTC
    // ISO strings with timezone info (e.g., "2025-10-22T18:00:00Z" or "2025-10-22T18:00:00+00:00") use their offset
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      // If no timezone info, treat as UTC by appending 'Z'
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    // Create date object from UTC datetime
    const utcDate = new Date(utcDateTimeStr);
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.error('Invalid date provided:', utcDateTime);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        fullDateTime: 'Invalid DateTime',
        timezone: tenantTimezone,
        rawDate: null
      };
    }

    // Format date in tenant timezone (e.g., "Oct 22, 2025")
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: tenantTimezone
    };
    const formattedDate = utcDate.toLocaleDateString('en-US', dateOptions);
    
    // Format time in tenant timezone (e.g., "2:00 PM")
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: tenantTimezone
    };
    const formattedTime = utcDate.toLocaleTimeString('en-US', timeOptions);
    
    // Full datetime string in tenant timezone
    const fullDateTime = utcDate.toLocaleString('en-US', {
      ...dateOptions,
      ...timeOptions
    });
    
    // Create a proper date object in tenant timezone for rawDate
    const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tenantTimezone }));

    // Debug logging with more details
    console.log('Native timezone conversion debug:', {
      input: utcDateTime,
      hasTimezoneInfo,
      utcDateTimeStr,
      utcDate: utcDate.toISOString(),
      tenantTimezone,
      formattedTime,
      formattedDate,
      utcHour: utcDate.getUTCHours(),
      utcMinute: utcDate.getUTCMinutes(),
      localHour: utcDate.getHours(),
      localMinute: utcDate.getMinutes(),
      // Additional debugging
      utcTimestamp: utcDate.getTime(),
      localTimestamp: new Date().getTime(),
      timezoneOffset: new Date().getTimezoneOffset(),
      // Test the conversion manually
      manualTest: new Date(utcDateTimeStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: tenantTimezone
      })
    });

    return {
      date: formattedDate,
      time: formattedTime,
      fullDateTime: fullDateTime,
      timezone: tenantTimezone,
      rawDate: tenantDate
    };
  } catch (error) {
    console.error('Native conversion error:', error);
    throw error;
  }
};

/**
 * Convert UTC datetime to tenant timezone with custom formatting
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted datetime string
 */
export const formatInTenantTimezone = (utcDateTime, tenantTimezone = 'America/New_York', options = {}) => {
  try {
    // Use Luxon if available (preferred method)
    if (DateTime) {
      return formatWithLuxon(utcDateTime, tenantTimezone, options);
    } else {
      // Fallback to native Date + Intl API
      return formatWithNative(utcDateTime, tenantTimezone, options);
    }
  } catch (error) {
    console.error('Error formatting timezone:', error);
    return 'Error';
  }
};

/**
 * Format using Luxon (preferred method)
 */
const formatWithLuxon = (utcDateTime, tenantTimezone, options = {}) => {
  try {
    let dt;
    
    if (typeof utcDateTime === 'string') {
      // If no timezone info, treat as UTC
      if (!utcDateTime.includes('Z') && !utcDateTime.includes('+') && !utcDateTime.includes('-')) {
        dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
      } else {
        dt = DateTime.fromISO(utcDateTime);
      }
    } else {
      dt = DateTime.fromJSDate(utcDateTime);
    }
    
    if (!dt.isValid) {
      return 'Invalid Date';
    }
    
    const tenantDt = dt.setZone(tenantTimezone);
    
    // Default Luxon format
    const defaultFormat = 'LLL d, yyyy h:mm a';
    const format = options.format || defaultFormat;
    
    return tenantDt.toFormat(format);
  } catch (error) {
    console.error('Luxon formatting error:', error);
    return 'Error';
  }
};

/**
 * Format using native Date + Intl API (fallback method)
 */
const formatWithNative = (utcDateTime, tenantTimezone, options = {}) => {
  try {
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      // If no timezone info, treat as UTC by appending 'Z'
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    const utcDate = new Date(utcDateTimeStr);
    
    if (isNaN(utcDate.getTime())) {
      return 'Invalid Date';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tenantTimezone
    };

    const formatOptions = { ...defaultOptions, ...options };
    return utcDate.toLocaleString('en-US', formatOptions);
  } catch (error) {
    console.error('Native formatting error:', error);
    return 'Error';
  }
};

/**
 * Get timezone offset string (e.g., "EDT", "EST", "PST")
 * @param {string} tenantTimezone - IANA timezone string
 * @returns {string} - Timezone abbreviation
 */
export const getTimezoneAbbreviation = (tenantTimezone = 'America/New_York') => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tenantTimezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart ? timeZonePart.value : tenantTimezone;
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error);
    return tenantTimezone;
  }
};

/**
 * Check if a date is today in tenant timezone
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string
 * @returns {boolean} - True if date is today
 */
export const isTodayInTenantTimezone = (utcDateTime, tenantTimezone = 'America/New_York') => {
  try {
    // Use Luxon if available (preferred method)
    if (DateTime) {
      return isTodayWithLuxon(utcDateTime, tenantTimezone);
    } else {
      // Fallback to native Date + Intl API
      return isTodayWithNative(utcDateTime, tenantTimezone);
    }
  } catch (error) {
    console.error('Error checking if today:', error);
    return false;
  }
};

/**
 * Check if today using Luxon (preferred method)
 */
const isTodayWithLuxon = (utcDateTime, tenantTimezone) => {
  try {
    let dt;
    
    if (typeof utcDateTime === 'string') {
      // If no timezone info, treat as UTC
      if (!utcDateTime.includes('Z') && !utcDateTime.includes('+') && !utcDateTime.includes('-')) {
        dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
      } else {
        dt = DateTime.fromISO(utcDateTime);
      }
    } else {
      dt = DateTime.fromJSDate(utcDateTime);
    }
    
    if (!dt.isValid) {
      return false;
    }
    
    const tenantDt = dt.setZone(tenantTimezone);
    const now = DateTime.now().setZone(tenantTimezone);
    
    return tenantDt.hasSame(now, 'day');
  } catch (error) {
    console.error('Luxon today check error:', error);
    return false;
  }
};

/**
 * Check if today using native Date + Intl API (fallback method)
 */
const isTodayWithNative = (utcDateTime, tenantTimezone) => {
  try {
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      // If no timezone info, treat as UTC by appending 'Z'
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    const utcDate = new Date(utcDateTimeStr);
    const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tenantTimezone }));
    const today = new Date();
    const tenantToday = new Date(today.toLocaleString('en-US', { timeZone: tenantTimezone }));
    
    return tenantDate.toDateString() === tenantToday.toDateString();
  } catch (error) {
    console.error('Native today check error:', error);
    return false;
  }
};

/**
 * Get relative time string (e.g., "Today", "Tomorrow", "Yesterday")
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (utcDateTime, tenantTimezone = 'America/New_York') => {
  try {
    // Use Luxon if available (preferred method)
    if (DateTime) {
      return getRelativeTimeWithLuxon(utcDateTime, tenantTimezone);
    } else {
      // Fallback to native Date + Intl API
      return getRelativeTimeWithNative(utcDateTime, tenantTimezone);
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Unknown';
  }
};

/**
 * Get relative time using Luxon (preferred method)
 */
const getRelativeTimeWithLuxon = (utcDateTime, tenantTimezone) => {
  try {
    let dt;
    
    if (typeof utcDateTime === 'string') {
      // If no timezone info, treat as UTC
      if (!utcDateTime.includes('Z') && !utcDateTime.includes('+') && !utcDateTime.includes('-')) {
        dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
      } else {
        dt = DateTime.fromISO(utcDateTime);
      }
    } else {
      dt = DateTime.fromJSDate(utcDateTime);
    }
    
    if (!dt.isValid) {
      return 'Invalid Date';
    }
    
    const tenantDt = dt.setZone(tenantTimezone);
    const now = DateTime.now().setZone(tenantTimezone);
    
    const diffDays = Math.ceil(tenantDt.diff(now, 'days').days);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    
    return tenantDt.toFormat('LLL d');
  } catch (error) {
    console.error('Luxon relative time error:', error);
    return 'Unknown';
  }
};

/**
 * Get relative time using native Date + Intl API (fallback method)
 */
const getRelativeTimeWithNative = (utcDateTime, tenantTimezone) => {
  try {
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      // If no timezone info, treat as UTC by appending 'Z'
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    const utcDate = new Date(utcDateTimeStr);
    const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tenantTimezone }));
    const today = new Date();
    const tenantToday = new Date(today.toLocaleString('en-US', { timeZone: tenantTimezone }));
    
    const diffTime = tenantDate.getTime() - tenantToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    
    return tenantDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: tenantTimezone 
    });
  } catch (error) {
    console.error('Native relative time error:', error);
    return 'Unknown';
  }
};

/**
 * Common timezone mappings for user-friendly names
 */
export const TIMEZONE_MAPPINGS = {
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'Europe/London': 'Greenwich Mean Time (GMT)',
  'Asia/Karachi': 'Pakistan Standard Time (PKT)',
  'Asia/Kolkata': 'Indian Standard Time (IST)',
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Australia/Sydney': 'Australian Eastern Time (AET)'
};

/**
 * Get user-friendly timezone name
 * @param {string} ianaTimezone - IANA timezone string
 * @returns {string} - User-friendly timezone name
 */
export const getTimezoneDisplayName = (ianaTimezone) => {
  return TIMEZONE_MAPPINGS[ianaTimezone] || ianaTimezone;
};
