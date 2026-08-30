const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token"); // Fallback for transition
}

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("rehab_admin_token") || localStorage.getItem("rehab_admin_token");
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  useAdminToken = false
) {
  const token = useAdminToken ? getAdminToken() : getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- Auth ---
export async function apiRegister(data: {
  name: string;
  mobile: string;
  email: string;
  password: string;
}) {
  const json = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  sessionStorage.setItem("rehab_token", json.access_token);
  return json;
}

export async function apiLogin(mobile: string, password: string) {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile, password }),
  });
  sessionStorage.setItem("rehab_token", json.access_token);
  return json;
}

export async function apiAdminLogin(mobile: string, password: string) {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile, password }),
  });
  // Verify role is admin by fetching /auth/me
  sessionStorage.setItem("rehab_token", json.access_token);
  const me = await apiFetch("/auth/me");
  if (me.role !== "admin") {
    sessionStorage.removeItem("rehab_token");
    throw new Error("Not an admin account");
  }
  // Store separately for admin session
  sessionStorage.removeItem("rehab_token");
  sessionStorage.setItem("rehab_admin_token", json.access_token);
  return me;
}

export async function apiGetMe() {
  return apiFetch("/auth/me");
}

export function apiLogout() {
  sessionStorage.removeItem("rehab_token");
  localStorage.removeItem("rehab_token"); // Clean up old storage
}

export function apiAdminLogout() {
  sessionStorage.removeItem("rehab_admin_token");
  localStorage.removeItem("rehab_admin_token"); // Clean up old storage
}

// --- Services ---
export async function apiGetServices() {
  return apiFetch("/services");
}

export async function apiGetAllServices() {
  return apiFetch("/services/all", {}, true);
}

export async function apiCreateService(data: {
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}) {
  return apiFetch("/services", { method: "POST", body: JSON.stringify(data) }, true);
}

export async function apiUpdateService(id: string, data: Partial<{
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}>) {
  return apiFetch(`/services/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export async function apiDeleteService(id: string) {
  return apiFetch(`/services/${id}`, { method: "DELETE" }, true);
}

// --- Requests ---
export async function apiCreateRequest(data: {
  service_id: string;
  property_type: string;
  location: string;
  preferred_date?: string;
  notes?: string;
}) {
  return apiFetch("/requests", { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetMyRequests() {
  return apiFetch("/requests/me");
}

export async function apiGetAllRequests(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return apiFetch(`/requests${qs}`, {}, true);
}

export async function apiUpdateRequestStatus(id: string, status: string) {
  return apiFetch(
    `/requests/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true
  );
}
