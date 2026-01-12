// usageExample.ts
// Example usage of idempotent API wrapper with retry and key reuse
import { likePost } from "./api";

async function usageExample() {
  const postId = 123;
  const currentUserId = "user-456";

  // First attempt (will create and store the idempotency key)
  try {
    const result = await likePost(postId, currentUserId);
    console.log("First like result:", result);
  } catch (err) {
    console.error("First like failed:", err);
  }

  // Simulate retry (e.g., after network error or page reload)
  try {
    const result = await likePost(postId, currentUserId);
    console.log("Retry like result (should reuse key):", result);
  } catch (err) {
    console.error("Retry like failed:", err);
  }
}

usageExample();
