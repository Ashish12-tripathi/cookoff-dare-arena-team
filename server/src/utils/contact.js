const normalizeContact = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const isValidPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
};
const isValidContact = (value) => isValidEmail(value) || isValidPhone(value);
module.exports = { normalizeContact, isValidEmail, isValidPhone, isValidContact };
