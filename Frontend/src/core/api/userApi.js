import { API_BASE_URL } from "./apiConfig";
import { clearAuthSession, getAuthToken } from "./authStorage";

export async function searchUsers(query) {
  const token = getAuthToken();
  const cleanQuery = String(query ?? "").trim();

  if (!token) {
    throw new Error("Login eerst om accounts te zoeken.");
  }

  if (cleanQuery.length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/users/search?query=${encodeURIComponent(cleanQuery)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    clearAuthSession();
    throw new Error("Je sessie is verlopen. Login opnieuw.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `User search failed with status ${response.status}`);
  }

  return data?.users ?? [];
}