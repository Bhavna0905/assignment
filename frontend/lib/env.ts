/** Resolve API/WS base URLs — works across localhost, 127.0.0.1, and LAN IPs in dev. */
function resolveHostUrl(envUrl: string | undefined, protocol: "http" | "ws"): string {
  const fallback =
    protocol === "http" ? "http://localhost:8000" : "ws://localhost:8000";

  if (!envUrl) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const port = protocol === "http" ? "8000" : "8000";
      return `${protocol}://${host}:${port}`;
    }
    return fallback;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && envUrl.includes("localhost")) {
      return envUrl.replace("localhost", host);
    }
  }

  return envUrl;
}

export function getApiBase(): string {
  return resolveHostUrl(process.env.NEXT_PUBLIC_API_URL, "http");
}

export function getWsBase(): string {
  return resolveHostUrl(process.env.NEXT_PUBLIC_WS_URL, "ws");
}
