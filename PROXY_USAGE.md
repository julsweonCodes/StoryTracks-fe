# Next.js API Proxy Usage Guide

## Overview

All frontend API calls now go through a Next.js API proxy layer at `/api/backend/*`. This proxy forwards requests to the backend server, eliminating CORS issues and keeping the backend URL server-side only.

## How It Works

### Architecture
```
Frontend Code → /api/backend/* → Next.js Proxy → Backend Server
```

### Example Flow
1. **Frontend makes request**: `axios.get('/api/backend/posts/feed')`
2. **Next.js proxy receives**: Request at `/api/backend/posts/feed`
3. **Proxy forwards to**: `${NEXT_PUBLIC_BACKEND_URL}/posts/feed`
4. **Backend responds**: Data is returned through proxy to frontend

## Usage Examples

### Using Axios (Recommended)

```typescript
import axios from 'axios';

// ✅ Correct - Using proxy
const response = await axios.get('/api/backend/posts/feed');

// ✅ Correct - With parameters
const response = await axios.get('/api/backend/posts/123');

// ✅ Correct - POST request
const response = await axios.post('/api/backend/users/login', {
  userId: 'user123',
  pwd: 'password'
});

// ❌ Wrong - Don't use full URL
const response = await axios.get('http://localhost:8080/api/v1/posts/feed');
```

### Using Fetch API

```typescript
// ✅ Correct - GET request
const response = await fetch('/api/backend/posts/feed');
const data = await response.json();

// ✅ Correct - POST with JSON body
const response = await fetch('/api/backend/blog/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(blogData),
});

// ✅ Correct - POST with FormData
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/backend/s3/upload/profile', {
  method: 'POST',
  body: formData,
});
```

### Query Parameters

```typescript
// ✅ Correct - Query params are preserved
const response = await axios.get('/api/backend/posts/feed?page=0&size=10');

// ✅ Correct - Using URLSearchParams
const params = new URLSearchParams({
  latMin: '37.5',
  latMax: '37.6',
});
const response = await fetch(`/api/backend/user-blog/1/posts/by-location?${params}`);
```

## Common Endpoints Migrated

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `${NEXT_PUBLIC_BASE_URL}/posts/feed` | `/api/backend/posts/feed` |
| `${NEXT_PUBLIC_BASE_URL}/users/login` | `/api/backend/users/login` |
| `${NEXT_PUBLIC_BASE_URL}/users/register` | `/api/backend/users/register` |
| `${NEXT_PUBLIC_BASE_URL}/posts/${id}` | `/api/backend/posts/${id}` |
| `${NEXT_PUBLIC_BASE_URL}/blog/save` | `/api/backend/blog/save` |
| `${NEXT_PUBLIC_BASE_URL}/s3/upload/profile` | `/api/backend/s3/upload/profile` |

## Authentication

The proxy automatically forwards all headers, including:
- `Authorization: Bearer ${token}` (JWT tokens)
- `Cookie` headers
- Custom headers

```typescript
// JWT token is automatically attached by axios interceptor
const response = await axios.get('/api/backend/users/followers/count');
// The proxy forwards: Authorization: Bearer <token>
```

## Benefits

1. **CORS Elimination**: No CORS issues since requests are same-origin
2. **Security**: Backend URL not exposed to client
3. **Flexibility**: Easy to switch backend servers (just update env var)
4. **Consistency**: Single point of configuration
5. **SSR Compatible**: Works with both client and server-side rendering

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api/v1
```

The `NEXT_PUBLIC_BACKEND_URL` is now **only** used by the Next.js proxy on the server side, never exposed to the client.

## Proxy Configuration

The proxy is configured at: `src/app/api/backend/[...path]/route.ts`

It supports:
- ✅ GET, POST, PUT, PATCH, DELETE methods
- ✅ Headers forwarding (cookies, auth, etc.)
- ✅ Query parameters
- ✅ JSON bodies
- ✅ FormData bodies
- ✅ Response headers forwarding

## Troubleshooting

### Request not reaching backend
1. Check that URL starts with `/api/backend/`
2. Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
3. Check browser network tab for the actual request URL

### Authentication issues
1. Ensure JWT token is in localStorage
2. Check axios interceptor is configured
3. Verify `Authorization` header is being forwarded

### CORS errors (shouldn't happen!)
- If you see CORS errors, you're likely calling the backend directly
- Make sure all requests go through `/api/backend/*`

## Migration Checklist

- [x] Created proxy route at `src/app/api/backend/[...path]/route.ts`
- [x] Updated axios config comments
- [x] Migrated all `use-*-query.ts` hooks
- [x] Migrated all `use-*-mutation.ts` hooks
- [x] Migrated pages (signup, profile, index, etc.)
- [x] Migrated auth.ts
- [x] Migrated s3-upload.ts
- [x] Migrated components (ai-summary-modal)
- [x] Updated sync-session API route
- [x] Removed direct backend URL references

All API calls now use the proxy! 🎉
