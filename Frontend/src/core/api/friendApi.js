import { API_BASE_URL } from "./apiConfig";
import { clearAuthSession, getAuthToken } from "./authStorage";

function getRequiredToken() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Login eerst om friends te gebruiken.");
  }

  return token;
}

async function readJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    clearAuthSession();
    throw new Error("Je sessie is verlopen. Login opnieuw.");
  }

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed with status ${response.status}`);
  }

  return data;
}

export async function getFriendsOverview() {
  const token = getRequiredToken();

  const response = await fetch(`${API_BASE_URL}/friends`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return readJsonResponse(response);
}

export async function sendFriendRequest(userId) {
  const token = getRequiredToken();

  const response = await fetch(`${API_BASE_URL}/friends`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
    }),
  });

  return readJsonResponse(response);
}

export async function acceptFriendRequest(friendshipId) {
  const token = getRequiredToken();

  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}/accept`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return readJsonResponse(response);
}

export async function rejectFriendRequest(friendshipId) {
  const token = getRequiredToken();

  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}/reject`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return readJsonResponse(response);
}

export async function deleteFriendship(friendshipId) {
  const token = getRequiredToken();

  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return readJsonResponse(response);
}