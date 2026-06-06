// Shared validation utilities

// Matches: username@domain.extension
// e.g. user.name+tag@sub.domain.co.uk
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(value: string): string {
  if (!value) return "Email is required.";
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email (e.g. you@example.com).";
  return "";
}

export function validatePassword(value: string): string {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

export function validateName(value: string): string {
  if (value && value.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
}

export function validateConfirmPassword(password: string, confirm: string): string {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
}
