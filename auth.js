/**
 * auth.js – Acme School
 * Handles user data (localStorage) and login validation.
 */

// ── Blocked free email providers ────────────────────────────
const FREE_DOMAINS = [
  'gmail.com','googlemail.com','yahoo.com','yahoo.es','hotmail.com',
  'hotmail.es','outlook.com','outlook.es','live.com','live.es',
  'icloud.com','me.com','mac.com','aol.com','protonmail.com',
  'proton.me','tutanota.com','yandex.com','mail.com','inbox.com',
  'zoho.com','msn.com','qq.com','163.com','126.com','gmx.com',
  'gmx.net','web.de','libero.it','wanadoo.fr','orange.fr',
];

const STORAGE_KEY = 'acme_users';

// ── Seed default admin if no users exist ─────────────────────
function seedDefaultUsers() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const defaults = [
    {
      id: '1001',
      fullName: 'Administrador Acme',
      email: 'admin@acme.edu',
      phone: '3001234567',
      role: 'Administrativo',
      // password: Admin123
      password: 'Admin123',
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
}

// ── Getters ──────────────────────────────────────────────────
export function getUsers() {
  seedDefaultUsers();
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// ── Validate email format ────────────────────────────────────
export function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ── Check if domain is a free/personal provider ──────────────
export function isFreeEmailDomain(email) {
  const domain = email.trim().toLowerCase().split('@')[1];
  return FREE_DOMAINS.includes(domain);
}

// ── Attempt login ────────────────────────────────────────────
export function attemptLogin(email, password) {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) return { ok: false, reason: 'no_user' };
  if (user.password !== password) return { ok: false, reason: 'wrong_pass' };
  // Store session
  sessionStorage.setItem('acme_session', JSON.stringify({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  }));
  return { ok: true, user };
}

// ── Session helpers ──────────────────────────────────────────
export function getSession() {
  const raw = sessionStorage.getItem('acme_session');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  sessionStorage.removeItem('acme_session');
}
