// idempotencyKeyManager.ts
// Utility for managing idempotency keys per user operation.
//
// WHY sessionStorage?
// - Keys persist across page reloads within the same browser tab/session.
// - This ensures the same key is reused for retries, duplicate clicks, and refresh/reload.
// - sessionStorage is cleared when the tab is closed, preventing stale keys from accumulating.
// - This is critical for true idempotency: the same logical operation must always use the same key.

/**
 * Check if we're running in a browser environment (not SSR)
 */
const isBrowser = typeof window !== "undefined" && typeof sessionStorage !== "undefined";

/**
 * In-memory fallback for SSR or environments without sessionStorage
 */
const memoryStorage = new Map<string, string>();

export class IdempotencyKeyManager {
  private static readonly PREFIX = "idem:";

  /**
   * Get or create an idempotency key for a given operationId.
   * The key is stored in sessionStorage (browser) or memory (SSR) to persist across retries.
   *
   * @param operationId Unique identifier for the user operation
   *   Examples:
   *   - "register:user@example.com"
   *   - "like:123:user456"
   *   - "follow:789:user456"
   * @returns The idempotency key (UUID string)
   */
  static getOrCreateKey(operationId: string): string {
    const storageKey = this.PREFIX + operationId;

    // Try to get existing key
    let key: string | null = null;
    if (isBrowser) {
      key = sessionStorage.getItem(storageKey);
    } else {
      key = memoryStorage.get(storageKey) ?? null;
    }

    // Generate new key if not found
    if (!key) {
      key = this.generateUUID();
      if (isBrowser) {
        sessionStorage.setItem(storageKey, key);
      } else {
        memoryStorage.set(storageKey, key);
      }
    }

    return key;
  }

  /**
   * Clear the idempotency key for a given operationId.
   * Call this ONLY after a successful API response to allow new operations.
   *
   * @param operationId Unique identifier for the user operation
   */
  static clearKey(operationId: string): void {
    const storageKey = this.PREFIX + operationId;
    if (isBrowser) {
      sessionStorage.removeItem(storageKey);
    } else {
      memoryStorage.delete(storageKey);
    }
  }

  /**
   * Generate a UUID for the idempotency key.
   * Uses crypto.randomUUID() if available, otherwise falls back to a custom implementation.
   */
  private static generateUUID(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // Fallback: generate a v4-like UUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export default IdempotencyKeyManager;
