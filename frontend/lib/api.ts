import { getApiBase } from "./env";
import type {
  DashboardMeetings,
  JoinMeetingResponse,
  Meeting,
  User,
} from "./types";

let userEmail: string | null = null;

export function setApiUserEmail(email: string | null) {
  userEmail = email;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra);
  if (userEmail) {
    headers.set("X-User-Email", userEmail);
  }
  return headers;
}

function networkErrorMessage(): string {
  const base = getApiBase();
  return `Cannot reach the server at ${base}. Start the backend (uvicorn on port 8000) and refresh.`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: authHeaders(init?.headers),
    });
  } catch {
    throw new Error(networkErrorMessage());
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: async (): Promise<{ status: string }> => {
    try {
      const res = await fetch(`${getApiBase()}/api/health`);
      if (!res.ok) throw new Error("unhealthy");
      return res.json() as Promise<{ status: string }>;
    } catch {
      throw new Error(networkErrorMessage());
    }
  },

  syncUser: (profile: {
    google_id: string;
    name: string;
    email: string;
    avatar_url?: string;
  }): Promise<User> =>
    request(`${getApiBase()}/api/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }),

  getMeetings: (): Promise<DashboardMeetings> =>
    request(`${getApiBase()}/api/meetings`),

  createInstant: (): Promise<Meeting & { join_url?: string }> =>
    request(`${getApiBase()}/api/meetings/instant`, { method: "POST" }),

  scheduleMeeting: (body: {
    title: string;
    description?: string;
    scheduled_start: string;
    duration_minutes: number;
  }): Promise<Meeting> =>
    request(`${getApiBase()}/api/meetings/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  validateMeeting: async (
    code: string
  ): Promise<{ ok: boolean; data: Meeting | null }> => {
    const res = await fetch(
      `${getApiBase()}/api/meetings/${encodeURIComponent(code)}`,
      { headers: authHeaders() }
    );
    const data = res.ok ? await res.json() : null;
    return { ok: res.ok, data };
  },

  joinMeeting: (code: string, displayName: string): Promise<JoinMeetingResponse> =>
    request(
      `${getApiBase()}/api/meetings/${encodeURIComponent(code)}/participants`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      }
    ),
};
