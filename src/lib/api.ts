// api.ts
// Strongly-typed API wrappers for idempotent POST endpoints.
//
// IDEMPOTENCY STRATEGY:
// - Each wrapper derives an operationId from its arguments (e.g., "like:123:user456")
// - getOrCreateKey(operationId) retrieves or creates a key stored in sessionStorage
// - The same key is reused across retries, duplicate clicks, and page reloads
// - On success, clearKey(operationId) removes the key to allow future operations
//
// This ensures true idempotency: the backend can deduplicate requests using the key.

import apiClient from "./apiClient";
import IdempotencyKeyManager from "./idempotencyKeyManager";

// =============================================================================
// Types for request/response payloads
// =============================================================================

export interface RegisterRequest {
  userId: string;
  pwd: string;
  email: string;
  birthYmd?: string;
  nickname: string;
  blogName: string;
  bio?: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface UploadProfileRequest {
  file: File;
}

export interface UploadProfileResponse {
  url: string;
}

export interface PostCreateRequest {
  title: string;
  ogText: string;
  aiGenText: string;
  images: ImageMetadata[];
}

export interface ImageMetadata {
  imgFileName: string;
  imgPath: string;
  geoLat: string;
  geoLong: string;
  imgDtm: string;
  thumbYn: "Y" | "N";
}

export interface PostCreateResponse {
  postId: number;
}

export interface LikeResponse {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface FollowResponse {
  success: boolean;
}

// =============================================================================
// Retry helper with exponential backoff
// =============================================================================

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Retry a function with exponential backoff for network errors/timeouts only.
 * The same idempotency key is used across all retries (handled by caller).
 */
async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, initialDelayMs = 1000, maxDelayMs = 5000 } = options;
  let lastErr: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      // Only retry on network errors or timeouts
      const isRetryable =
        err.code === "ECONNABORTED" ||
        err.code === "ETIMEDOUT" ||
        err.message === "Network Error" ||
        err.message?.includes("timeout");

      if (!isRetryable) {
        throw err;
      }

      lastErr = err;

      // Don't delay after the last attempt
      if (attempt < maxRetries) {
        const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastErr;
}

// =============================================================================
// API Wrappers
// =============================================================================

/**
 * Register user (idempotent)
 * operationId: "register:<email>"
 */
export async function registerUser(req: RegisterRequest): Promise<RegisterResponse> {
  const operationId = `register:${req.email}`;
  const key = IdempotencyKeyManager.getOrCreateKey(operationId);
  try {
    const response = await retry(() =>
      apiClient.post<RegisterResponse>(
        "/api/backend/users/register",
        req,
        { headers: { "Idempotency-Key": key } }
      )
    );
    IdempotencyKeyManager.clearKey(operationId);
    return response.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Upload profile image (idempotent)
 * operationId: "uploadProfile:<currentUserId>"
 */
export async function uploadProfileImage(req: UploadProfileRequest, currentUserId: string): Promise<UploadProfileResponse> {
  const operationId = `uploadProfile:${currentUserId}`;
  const key = IdempotencyKeyManager.getOrCreateKey(operationId);
  const formData = new FormData();
  formData.append("file", req.file);
  try {
    const response = await retry(() =>
      apiClient.post<UploadProfileResponse>(
        "/api/backend/s3/upload/profile",
        formData,
        { headers: { "Idempotency-Key": key } }
      )
    );
    IdempotencyKeyManager.clearKey(operationId);
    return response.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Create post (idempotent)
 * operationId: "postCreate:<draftId>"
 */
export async function createPost(req: PostCreateRequest, draftId: string): Promise<PostCreateResponse> {
  const operationId = `postCreate:${draftId}`;
  const key = IdempotencyKeyManager.getOrCreateKey(operationId);
  try {
    const response = await retry(() =>
      apiClient.post<PostCreateResponse>(
        "/api/backend/posts/create",
        req,
        { headers: { "Idempotency-Key": key } }
      )
    );
    IdempotencyKeyManager.clearKey(operationId);
    return response.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Like a post (idempotent)
 * operationId: "like:<postId>:<currentUserId>"
 */
export async function likePost(postId: number, currentUserId: string): Promise<LikeResponse> {
  const operationId = `like:${postId}:${currentUserId}`;
  const key = IdempotencyKeyManager.getOrCreateKey(operationId);
  try {
    const response = await retry(() =>
      apiClient.post<LikeResponse>(
        `/api/backend/posts/${postId}/like`,
        {},
        { headers: { "Idempotency-Key": key } }
      )
    );
    IdempotencyKeyManager.clearKey(operationId);
    return response.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Follow a user (idempotent)
 * operationId: "follow:<targetUserId>:<currentUserId>"
 */
export async function followUser(targetUserId: number, currentUserId: string): Promise<FollowResponse> {
  const operationId = `follow:${targetUserId}:${currentUserId}`;
  const key = IdempotencyKeyManager.getOrCreateKey(operationId);
  try {
    const response = await retry(() =>
      apiClient.post<FollowResponse>(
        `/api/backend/users/${targetUserId}/follow`,
        {},
        { headers: { "Idempotency-Key": key } }
      )
    );
    IdempotencyKeyManager.clearKey(operationId);
    return response.data;
  } catch (err) {
    throw err;
  }
}

// --- Usage Example ---
/**
 * Example: Like a post with retry and idempotency key reuse
 */
async function exampleLikePost(postId: number, currentUserId: string) {
  try {
    const result = await likePost(postId, currentUserId);
    console.log("Like result:", result);
  } catch (err) {
    console.error("Failed to like post:", err);
  }
}

// Add similar usage examples for other endpoints as needed
