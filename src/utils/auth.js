import { users } from '../data/users.js';

// All auth state is stored under one localStorage key for easy login persistence.
const AUTH_KEY = 'sms_user';

export function login(email, password) {
  // Normalize the email so simple casing mistakes do not block login.
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password
  );

  if (!user) {
    return null;
  }

  // Store only safe session fields; the password is never saved in localStorage.
  const sessionUser = {
    email: user.email,
    role: user.role,
    name: user.name,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export function logout() {
  // Removing the saved session is enough to make route guards send users to login.
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser() {
  try {
    // Route guards and dashboard UI read the current user from localStorage.
    const rawUser = localStorage.getItem(AUTH_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    // If the stored JSON is corrupted, clear it so the app can recover cleanly.
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}
