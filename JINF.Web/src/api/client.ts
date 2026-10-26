import * as mock from "./mock";
import type { Category, Claim, ItemFilters, ItemReport, Location, NewReport, Stats, User } from "./types";

// Every page talks to the backend through this file. While VITE_USE_MOCKS is not "false"
// the functions return sample data from mock.ts, so the UI can be built before the API exists.
const useMocks = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = <T>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 150));

let token: string | null = localStorage.getItem("jinf.token");
export function setToken(value: string | null) {
  token = value;
  if (value) localStorage.setItem("jinf.token", value);
  else localStorage.removeItem("jinf.token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const res = await fetch(`/api${path}`, { ...init, headers });
  if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : res.json();
}

// ---- Auth ----

export async function login(email: string, password: string): Promise<User> {
  if (useMocks) {
    const isAdmin = email.toLowerCase().startsWith("admin");
    setToken("mock-token");
    return delay({ id: isAdmin ? "a1" : "u1", fullName: isAdmin ? "Reception Admin" : "Test Student", email, role: isAdmin ? "Admin" : "User" });
  }
  const { accessToken } = await request<{ accessToken: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  setToken(accessToken);
  return me();
}

export async function register(fullName: string, email: string, password: string): Promise<void> {
  if (useMocks) return delay(undefined);
  await request("/auth/register", { method: "POST", body: JSON.stringify({ fullName, email, password }) });
}

export async function me(): Promise<User> {
  return request<User>("/auth/me");
}

// ---- Lookups ----

export const getCategories = (): Promise<Category[]> => (useMocks ? delay(mock.categories) : request("/categories"));
export const getLocations = (): Promise<Location[]> => (useMocks ? delay(mock.locations) : request("/locations"));

// ---- Items ----

export async function getItems(filters: ItemFilters = {}): Promise<ItemReport[]> {
  if (useMocks) {
    const q = filters.q?.toLowerCase().trim();
    return delay(
      mock.items.filter(
        (i) =>
          i.status !== "Archived" &&
          (!filters.type || i.reportType === filters.type) &&
          (!filters.categoryId || i.category.id === filters.categoryId) &&
          (!filters.locationId || i.location.id === filters.locationId) &&
          (!q || `${i.title} ${i.description}`.toLowerCase().includes(q)),
      ),
    );
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== "" && params.set(k, String(v)));
  return request(`/items?${params}`);
}

export async function getItem(id: number): Promise<ItemReport> {
  if (useMocks) {
    const item = mock.items.find((i) => i.id === id);
    if (!item) throw new Error("Item not found");
    return delay(item);
  }
  return request(`/items/${id}`);
}

export async function getMyItems(userId: string): Promise<ItemReport[]> {
  if (useMocks) return delay(mock.items.filter((i) => i.reporterId === userId));
  return request("/items/mine");
}

export async function createReport(report: NewReport): Promise<ItemReport> {
  if (useMocks) {
    const item: ItemReport = {
      id: Math.max(...mock.items.map((i) => i.id)) + 1,
      reportType: report.reportType,
      title: report.title,
      description: report.description,
      category: mock.categories.find((c) => c.id === report.categoryId)!,
      location: mock.locations.find((l) => l.id === report.locationId)!,
      eventDate: report.eventDate,
      status: "Open",
      createdAt: new Date().toISOString(),
      reporterId: "u1",
    };
    mock.items.unshift(item);
    return delay(item);
  }
  const form = new FormData();
  Object.entries(report).forEach(([k, v]) => v !== undefined && form.append(k, v instanceof File ? v : String(v)));
  return request("/items", { method: "POST", body: form });
}

// ---- Claims ----

export async function createClaim(itemReportId: number, proofOfOwnership: string): Promise<Claim> {
  if (useMocks) {
    const item = mock.items.find((i) => i.id === itemReportId)!;
    const claim: Claim = { id: Date.now(), itemReportId, itemTitle: item.title, claimantName: "Test Student", proofOfOwnership, status: "Pending", createdAt: new Date().toISOString() };
    mock.claims.unshift(claim);
    return delay(claim);
  }
  return request("/claims", { method: "POST", body: JSON.stringify({ itemReportId, proofOfOwnership }) });
}

export const getMyClaims = (): Promise<Claim[]> => (useMocks ? delay(mock.claims.filter((c) => c.claimantName === "Test Student")) : request("/claims/mine"));
export const getClaims = (): Promise<Claim[]> => (useMocks ? delay(mock.claims) : request("/claims"));

export async function decideClaim(id: number, approve: boolean, reason?: string): Promise<void> {
  if (useMocks) {
    const claim = mock.claims.find((c) => c.id === id)!;
    claim.status = approve ? "Approved" : "Rejected";
    claim.decisionReason = reason;
    if (approve) mock.items.find((i) => i.id === claim.itemReportId)!.status = "Claimed";
    return delay(undefined);
  }
  await request(`/claims/${id}/${approve ? "approve" : "reject"}`, { method: "PUT", body: JSON.stringify({ reason }) });
}

// ---- Admin ----

export async function getStats(): Promise<Stats> {
  if (useMocks) {
    const count = (s: string) => mock.items.filter((i) => i.status === s).length;
    return delay({ open: count("Open"), claimed: count("Claimed"), returned: count("Returned"), pendingClaims: mock.claims.filter((c) => c.status === "Pending").length });
  }
  return request("/admin/stats");
}
