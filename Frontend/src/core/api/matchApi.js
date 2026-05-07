import { API_BASE_URL } from "./apiConfig";
import { getAuthToken } from "./authStorage";

function createAuthHeaders() {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function saveMatchToApi(matchRecord) {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    method: "POST",
    headers: createAuthHeaders(),
    body: JSON.stringify(matchRecord),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ?? `Match API save failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getMatchesFromApi() {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    method: "GET",
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ?? `Match API fetch failed with status ${response.status}`
    );
  }

  return response.json();
}