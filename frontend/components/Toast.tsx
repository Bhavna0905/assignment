"use client";

interface ToastProps {
  message: string;
  variant?: "error" | "success" | "info";
  onDismiss?: () => void;
}

export default function Toast({
  message,
  variant = "info",
  onDismiss,
}: ToastProps) {
  const styles = {
    error: "bg-red-600 text-white",
    success: "bg-green-600 text-white",
    info: "bg-zoom-primary text-white",
  };

  return (
    <div
      className={`fixed left-4 right-4 top-[max(3.5rem,env(safe-area-inset-top))] z-[100] mx-auto max-w-md rounded-md px-4 py-2.5 text-sm shadow-lg sm:left-1/2 sm:right-auto sm:max-w-lg sm:-translate-x-1/2 ${styles[variant]}`}
      role="alert"
    >
      <div className="flex items-center justify-center gap-3 sm:justify-start">
        <span className="text-center sm:text-left">{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="opacity-80 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
