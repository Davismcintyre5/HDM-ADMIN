export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));

export const isUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

export const isNonEmpty = (s) => String(s || '').trim().length > 0;

export const minLength = (s, n) => String(s || '').length >= n;

export const maxLength = (s, n) => String(s || '').length <= n;

export const isNumeric = (s) => /^\d+$/.test(String(s || ''));

export const isStrongPassword = (s, min = 8) => {
  const str = String(s || '');
  if (str.length < min) return false;
  if (!/[a-zA-Z]/.test(str)) return false;
  if (!/\d/.test(str)) return false;
  return true;
};

// Mongo ObjectId or similar 24-hex id
export const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s || ''));