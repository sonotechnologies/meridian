"use client";

// ---------------------------------------------------------------------
// Demo-only auth layer. Everything lives in the browser's localStorage —
// there is no server, no network request, no real backend. This is meant
// to demonstrate a functional sign-up/login/session flow for a UI demo,
// not to be production auth.
// ---------------------------------------------------------------------

const USERS_KEY = "meridianDemoUsers";
const SESSION_KEY = "meridianDemoSession";

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signUp({ fullName, email, phone, password }) {
  const users = getUsers();
  const key = email.trim().toLowerCase();

  if (users[key]) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);

  users[key] = {
    fullName: fullName.trim(),
    email: key,
    phone: phone.trim(),
    passwordHash,
    balance: 300000,
    transactions: [
      {
        id: 1,
        name: "Opening balance",
        date: new Date().toLocaleDateString("en-US"),
        amount: 300000,
        icon: "🏦",
      }
    ],
    createdAt: new Date().toISOString(),
  };

  saveUsers(users);
  localStorage.setItem(SESSION_KEY, key);
  return users[key];
}

export async function logIn({ email, password }) {
  const users = getUsers();
  const key = email.trim().toLowerCase();
  const user = users[key];

  if (!user) {
    throw new Error("No account found with this email.");
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Incorrect password.");
  }

  localStorage.setItem(SESSION_KEY, key);
  return user;
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const key = localStorage.getItem(SESSION_KEY);
  if (!key) return null;
  const users = getUsers();
  return users[key] || null;
}

export function updateCurrentUser(updates) {
  const key = localStorage.getItem(SESSION_KEY);
  if (!key) return null;
  const users = getUsers();
  if (!users[key]) return null;
  users[key] = { ...users[key], ...updates };
  saveUsers(users);
  return users[key];
}

export async function updatePassword({ currentPassword, newPassword }) {
  const key = localStorage.getItem(SESSION_KEY);
  if (!key) throw new Error("Not signed in.");
  const users = getUsers();
  const user = users[key];
  if (!user) throw new Error("Not signed in.");

  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== user.passwordHash) {
    throw new Error("Current password is incorrect.");
  }

  const newHash = await hashPassword(newPassword);
  users[key] = { ...user, passwordHash: newHash };
  saveUsers(users);
  return true;
}

export function addTransaction(tx) {
  const key = localStorage.getItem(SESSION_KEY);
  if (!key) return null;
  const users = getUsers();
  const user = users[key];
  if (!user) return null;
  user.transactions = [{ id: Date.now(), ...tx }, ...user.transactions];
  saveUsers(users);
  return user;
}
