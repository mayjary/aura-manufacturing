const API_BASE = "http://localhost:5001";

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    // Handle 401 Unauthorized - authentication required
    if (res.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      throw new AuthError("Your session has expired. Please log in again.");
    }

    let errorMessage = "API request failed";
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
