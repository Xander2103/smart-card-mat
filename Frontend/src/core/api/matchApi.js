import { API_BASE_URL } from "./apiConfig";

export async function saveMatchToApi(matchRecord) {
  const response = await fetch(`${API_BASE_URL}/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
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
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Match API fetch failed with status ${response.status}`);
  }

  return response.json();
}