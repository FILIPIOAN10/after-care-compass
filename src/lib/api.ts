// Client API către backend-ul Spring Boot.
// În dezvoltare poți seta VITE_API_URL în .env.local (ex: http://localhost:8090).
// În producție, dacă nu setezi nimic, utilizatorul poate configura URL-ul direct
// din UI (dialogul „Setări API”), iar valoarea e salvată în localStorage.

const FALLBACK_API_URL = "http://localhost:8090";
const STORAGE_KEY = "after.api_url";

function envApiUrl(): string | undefined {
  const v = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL;
  return v && v.length > 0 ? v.replace(/\/$/, "") : undefined;
}

export function hasBuildTimeApiUrl(): boolean {
  return envApiUrl() !== undefined;
}

export function getStoredApiUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredApiUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url && url.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ""));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("after:api-url-changed"));
  }
}

export function getApiBase(): string {
  const fromEnv = envApiUrl();
  if (fromEnv) return fromEnv;
  const stored = getStoredApiUrl();
  if (stored) return stored.replace(/\/$/, "");
  return FALLBACK_API_URL;
}

const TOKEN_KEY = "after.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("after:auth-changed"));
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = "Nu am putut contacta serverul.") {
    super(message);
  }
}

type RequestInitJson = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T = unknown>(path: string, init: RequestInitJson = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  let body: BodyInit | undefined;

  if (init.body !== undefined && init.body !== null) {
    if (init.body instanceof FormData) {
      body = init.body;
    } else if (typeof init.body === "string") {
      body = init.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      ...init,
      headers,
      body,
    });
  } catch {
    throw new NetworkError();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");
  const payload = isJson
    ? await res.json().catch(() => undefined)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      isJson &&
      payload &&
      typeof payload === "object" &&
      "message" in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).message)
        : typeof payload === "string" && payload.length > 0
          ? payload
          : `Eroare ${res.status}`;
    if (res.status === 401) {
      setToken(null);
    }
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

export function apiDownloadUrl(path: string): string {
  return `${getApiBase()}${path}`;
}

/**
 * Verifică dacă backend-ul răspunde. Folosește un endpoint public (no auth)
 * așa că nu necesită token. Întoarce true dacă răspunde 2xx.
 */
export async function pingApi(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/api/translator/suggestions`, {
      method: "GET",
      signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ===== Tipuri partajate =====

export type UserSummary = { id: string; fullName: string; email: string };
export type AuthResponse = { token: string; user: UserSummary };

export type PlaceOfDeath = "HOSPITAL" | "HOME" | "ABROAD" | "CARE_FACILITY";
export type TaskStatus = "DONE" | "PENDING" | "WAITING" | "MISSING";
export type TaskPhase = "IMMEDIATE" | "THIS_WEEK" | "LONG_TERM";

export type CaseResponse = {
  id: string;
  familyName: string;
  ownerName: string;
  deceasedName: string | null;
  deceasedCnp: string | null;
  deathDate: string | null;
  deathPlace: string | null;
  maritalStatus: string | null;
  placeOfDeath: PlaceOfDeath | null;
  wasRetired: boolean;
  ownedProperty: boolean;
  ownedVehicle: boolean;
  wasCompanyAdmin: boolean;
  hasSurvivingFamily: boolean;
  totalTasks: number;
  completedTasks: number;
};

export type OnboardingRequest = {
  placeOfDeath: PlaceOfDeath;
  deceasedName?: string;
  deceasedCnp?: string;
  deathDate?: string;
  deathPlace?: string;
  maritalStatus?: string;
  wasRetired: boolean;
  ownedProperty: boolean;
  ownedVehicle: boolean;
  wasCompanyAdmin: boolean;
  hasSurvivingFamily: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  place: string | null;
  phase: TaskPhase;
  status: TaskStatus;
  orderIndex: number | null;
  note: string | null;
  updatedAt: string | null;
};

export type DocumentResponse = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type MemberRole = "ADMIN" | "FAMILY" | "LAWYER" | "CAREGIVER";
export type InvitationStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type FamilyMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  createdAt: string;
};

export type ActivityKind =
  | "UPLOAD"
  | "TASK_UPDATE"
  | "NOTE"
  | "LOGIN"
  | "VIEW"
  | "INVITE"
  | "SECURITY";

export type ActivityEntry = {
  id: string;
  actor: string;
  message: string;
  kind: ActivityKind;
  createdAt: string;
};

export type TranslatorResponse = { term: string; explanation: string; known: boolean };
