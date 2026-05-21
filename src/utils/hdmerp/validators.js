export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Invalid email address';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
}

export function validateNumber(value, fieldName) {
  if (value === '' || value === null || value === undefined) return '';
  if (isNaN(Number(value))) return `${fieldName} must be a number`;
  if (Number(value) < 0) return `${fieldName} must be positive`;
  return '';
}