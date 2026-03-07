/**
 * Sanitise errors before showing in toasts.
 * End-user errors are fully generic; admin errors translate DB/API errors
 * into actionable hints without exposing schema internals.
 */

const GENERIC_USER_MESSAGE = "Something went wrong. Please try again later.";

/** For public-facing pages (e.g. BuilderSubmit). Never leak internals. */
export function userFriendlyError(_err: unknown): string {
  return GENERIC_USER_MESSAGE;
}

// ── Admin error mapping ─────────────────────────────────────────────────────

interface ErrorPattern {
  test: (msg: string) => boolean;
  message: string;
}

const ADMIN_PATTERNS: ErrorPattern[] = [
  {
    test: (m) => m.includes("duplicate key") || m.includes("unique constraint") || m.includes("already exists"),
    message: "A record with that value already exists. Check for duplicates and try again.",
  },
  {
    test: (m) => m.includes("violates foreign key"),
    message: "This record is linked to other data and can't be changed that way. Remove related records first.",
  },
  {
    test: (m) => m.includes("violates not-null") || m.includes("null value in column"),
    message: "A required field is missing. Please fill in all required fields.",
  },
  {
    test: (m) => m.includes("permission denied") || m.includes("row-level security"),
    message: "You don't have permission to perform this action. Try logging in again.",
  },
  {
    test: (m) => m.includes("jwt") || m.includes("access_token") || m.includes("not authenticated"),
    message: "Your session has expired. Please reload the page and log in again.",
  },
  {
    test: (m) => m.includes("Failed to fetch") || m.includes("NetworkError") || m.includes("network"),
    message: "Network error — check your internet connection and try again.",
  },
  {
    test: (m) => m.includes("timeout") || m.includes("timed out"),
    message: "The request timed out. Please try again.",
  },
  {
    test: (m) => m.includes("rate limit") || m.includes("too many requests"),
    message: "Too many requests. Wait a moment and try again.",
  },
];

/** For admin pages. Translates known DB/API errors into actionable hints. */
export function adminFriendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  for (const pattern of ADMIN_PATTERNS) {
    if (pattern.test(lower)) return pattern.message;
  }

  // Fallback — don't leak raw message
  return "Operation failed. If this persists, check the data and try again.";
}
