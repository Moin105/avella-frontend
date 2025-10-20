/**
 * Timezone utility functions for converting UTC times to tenant timezone
 */

/**
 * Convert UTC datetime to tenant timezone
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string (e.g., 'America/New_York')
 * @returns {Object} - { date, time, fullDateTime, timezone }
 */
export const convertToTenantTimezone = (utcDateTime, tenantTimezone = 'America/New_York') => {
  try {
    // Robust timezone detection: check for explicit timezone indicators
    // ISO strings without timezone info (e.g., "2025-10-22T18:00:00") are treated as UTC
    // ISO strings with timezone info (e.g., "2025-10-22T18:00:00Z" or "2025-10-22T18:00:00+00:00") use their offset
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           utcDateTimeStr.includes('-') ||
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
        timezone: tenantTimezone
      };
    }

    // Format date in tenant timezone (e.g., "Oct 20, 2025")
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

    // Debug logging
    console.log('Timezone conversion debug:', {
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
      localMinute: utcDate.getMinutes()
    });

    return {
      date: formattedDate,
      time: formattedTime,
      fullDateTime: fullDateTime,
      timezone: tenantTimezone,
      rawDate: tenantDate
    };
  } catch (error) {
    console.error('Error converting timezone:', error);
    return {
      date: 'Error',
      time: 'Error',
      fullDateTime: 'Error',
      timezone: tenantTimezone
    };
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
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           utcDateTimeStr.includes('-') ||
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
    console.error('Error formatting timezone:', error);
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
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           utcDateTimeStr.includes('-') ||
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
    console.error('Error checking if today:', error);
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
    // Use the same robust timezone detection as convertToTenantTimezone
    let utcDateTimeStr = utcDateTime;
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           utcDateTimeStr.includes('-') ||
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
    console.error('Error getting relative time:', error);
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
