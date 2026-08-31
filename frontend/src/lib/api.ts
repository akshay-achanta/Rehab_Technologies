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
    // Pydantic validation errors return detail as an array of objects
    if (Array.isArray(err.detail)) {
      const msg = err.detail.map((e: any) => `${e.loc?.slice(-1)[0] ?? ''}: ${e.msg}`).join(", ");
      throw new Error(msg || "Validation failed");
    }
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
  sessionStorage.setItem("rehab_role", "customer");
  return json;
}

export async function apiLogin(mobile: string, password: string) {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile, password }),
  });
  sessionStorage.setItem("rehab_token", json.access_token);
  
  // Fetch me to get role
  const me = await apiFetch("/auth/me");
  sessionStorage.setItem("rehab_role", me.role);
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
  sessionStorage.setItem("rehab_role", "admin");
  return me;
}

export async function apiGetMe() {
  return apiFetch("/auth/me");
}

export function apiLogout() {
  sessionStorage.removeItem("rehab_token");
  sessionStorage.removeItem("rehab_role");
  localStorage.removeItem("rehab_token"); // Clean up old storage
}

export function apiAdminLogout() {
  sessionStorage.removeItem("rehab_admin_token");
  sessionStorage.removeItem("rehab_role");
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

// Used by admin (sends rehab_admin_token)
export async function apiUpdateRequestStatus(id: string, status: string) {
  return apiFetch(`/requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, true);
}

// Used by employee (sends rehab_token)
export async function apiUpdateEmployeeRequestStatus(id: string, status: string) {
  return apiFetch(`/requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// --- Employees ---
export async function apiEmployeeLogin(mobile: string, password: string) {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile, password }),
  });
  sessionStorage.setItem("rehab_token", json.access_token);
  const me = await apiFetch("/auth/me");
  if (me.role !== "employee") {
    sessionStorage.removeItem("rehab_token");
    throw new Error("Not an employee account");
  }
  sessionStorage.setItem("rehab_role", "employee");
  return me;
}

export async function apiGetEmployees() {
  return apiFetch("/employees", {}, true);
}

export async function apiCreateEmployee(data: any) {
  return apiFetch("/employees", { method: "POST", body: JSON.stringify(data) }, true);
}

export async function apiUpdateEmployee(id: string, data: any) {
  return apiFetch(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export async function apiDeleteEmployee(id: string) {
  return apiFetch(`/employees/${id}`, { method: "DELETE" }, true);
}

export async function apiAssignEmployees(requestId: string, employeeIds: string[]) {
  return apiFetch(`/requests/${requestId}/assign`, {
    method: "POST",
    body: JSON.stringify({ employee_ids: employeeIds })
  }, true);
}

export async function apiGetAssignedRequests() {
  return apiFetch("/requests/assigned");
}
