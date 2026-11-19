// Local: set VITE_API_URL in .env. Production: leave unset so calls go to /api on the same domain.
const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty response
  }

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong");
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};