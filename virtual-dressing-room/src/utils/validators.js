// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate full name
 * @param {string} name - Name to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateFullName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }

  return { isValid: true, message: 'Name is valid' };
};

/**
 * Validate signup form data
 * @param {Object} formData - { email, password, confirmPassword, fullName }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateSignupForm = (formData) => {
  const errors = {};

  // Validate full name
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message;
  }

  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form data
 * @param {Object} formData - { email, password }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  validatePassword,
  validateFullName,
  validateSignupForm,
  validateLoginForm,
};
