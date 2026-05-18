import { API_BASE_URL } from "./apiConfig";
import { clearAuthSession, getAuthToken, saveAuthSession } from "./authStorage";

export async function registerUser({ name, username, email, password }) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Register failed with status ${response.status}`);
  }

  saveAuthSession(data);

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Login failed with status ${response.status}`);
  }

  saveAuthSession(data);

  return data;
}

export async function getCurrentUser() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearAuthSession();
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Fetch current user failed with status ${response.status}`);
  }

  return data?.user ?? null;
}

export async function logoutUser() {
  const token = getAuthToken();

  if (!token) {
    clearAuthSession();
    return;
  }

  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => null);

  clearAuthSession();
}