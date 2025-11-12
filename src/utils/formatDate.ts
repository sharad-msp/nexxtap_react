export const formatDate = (date: string | Date | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) {
    return 'N/A';
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Backend now sends raw datetime with timezone info
    // Just parse it directly - Laravel sends full ISO format
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'N/A';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  // Convert to local timezone using browser's built-in conversion
  const formatted = dateObj.toLocaleDateString('en-US', options || defaultOptions);
  
  return formatted;
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) {
    return 'N/A';
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Backend now sends raw datetime with timezone info
    // Just parse it directly - Laravel sends full ISO format
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateTime:', date);
    return 'N/A';
  }
  
  // Convert to local timezone using browser's built-in conversion
  const formatted = dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  });
  
  return formatted;
};

export const formatTime = (date: string | Date | null): string => {
  if (!date) {
    return 'N/A';
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Backend now sends raw datetime with timezone info
    // Just parse it directly - Laravel sends full ISO format
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTime:', date);
    return 'N/A';
  }
  
  // Convert to local timezone using browser's built-in conversion
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  });
};

// Utility function to convert UTC date to local timezone
export const convertUTCToLocal = (date: string | Date | null): Date | null => {
  if (!date) {
    return null;
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Handle various date formats from backend
    let dateString = date.trim();
    
    // Force UTC interpretation for dates without timezone
    if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-')) {
      // If it has T but no timezone, add Z
      if (dateString.includes('T')) {
        dateString = dateString + 'Z';
      } else {
        // If it's just date and time, add T and Z
        dateString = dateString.replace(' ', 'T') + 'Z';
      }
    }
    
    dateObj = new Date(dateString);
  } else {
    dateObj = date;
  }
  
  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to convertUTCToLocal:', date);
    return null;
  }
  
  return dateObj;
};

export const getRelativeTime = (date: string | Date | null): string => {
  if (!date) {
    return 'N/A';
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Backend now sends raw datetime with timezone info
    // Just parse it directly - Laravel sends full ISO format
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to getRelativeTime:', date);
    return 'N/A';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(dateObj);
};
