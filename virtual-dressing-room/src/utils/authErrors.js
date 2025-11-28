// src/utils/authErrors.js

/**
 * Map Supabase auth errors to user-friendly messages
 * @param {Error|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error.message || error;

  // Email validation errors
  if (errorMessage.includes('invalid email')) {
    return 'Please enter a valid email address';
  }

  if (errorMessage.includes('already registered')) {
    return 'This email is already registered. Please login or use a different email.';
  }

  // Password errors
  if (errorMessage.includes('password')) {
    if (errorMessage.includes('weak')) {
      return 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.';
    }
    if (errorMessage.includes('mismatch')) {
      return 'Passwords do not match';
    }
    return 'Password is invalid or too short (minimum 8 characters)';
  }

  // Authentication errors
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (errorMessage.includes('Email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }

  if (errorMessage.includes('User not found')) {
    return 'No account found with this email. Please sign up first.';
  }

  if (errorMessage.includes('Too many requests')) {
    return 'Too many login attempts. Please try again later.';
  }

  // OAuth errors
  if (errorMessage.includes('OAuth')) {
    return 'Social login failed. Please try again or use email/password.';
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Default: return original message if it's user-friendly
  return errorMessage;
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    message.includes('connection')
  );
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return (
    message.includes('auth') ||
    message.includes('credentials') ||
    message.includes('password') ||
    message.includes('email')
  );
};

/**
 * Check if error is a validation error
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return (
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format')
  );
};

export default getAuthErrorMessage;
