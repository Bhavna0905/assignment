export type FlashMessage = {
  type: "error" | "success" | "info";
  message: string;
};

const FLASH_KEY = "zoom-clone-flash";

export function setFlash(flash: FlashMessage) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify(flash));
  }
}

export function consumeFlash(): FlashMessage | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    return JSON.parse(raw) as FlashMessage;
  } catch {
    return null;
  }
}
