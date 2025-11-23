# NextAuth.js Configuration Guide

## What was set up:

### 1. **Authentication Provider** (`@/lib/auth.ts`)
- Configured NextAuth with CredentialsProvider
- Authenticates using your backend `/users/login` endpoint
- Returns user data with all profile fields (id, userId, email, nickname, bio, blogName, birthYmd, profileImg)

### 2. **API Route** (`/pages/api/auth/[...nextauth].ts`)
- Handles all NextAuth endpoints
- No need to call your backend login API directly from components anymore

### 3. **Session Provider** (`@/providers/auth-provider.tsx`)
- Wraps the entire app with NextAuth SessionProvider
- Automatically included in _app.tsx

### 4. **Custom Hook** (`@/hooks/use-auth.ts`)
- `useAuth()` hook for accessing session in components
- Automatically redirects unauthenticated users to /login
- Provides `session`, `isLoading`, `isAuthenticated`, and `updateSession()`

### 5. **Type Definitions** (`@/types/next-auth.d.ts`)
- Extended NextAuth User and Session types with custom fields
- Full TypeScript support for all user data

### 6. **Environment Variables**
- Added `NEXTAUTH_SECRET` to `.env.local`
- This should be a secure random string in production

## Benefits:

✅ **Secure Session Management** - JWT tokens stored in httpOnly cookies
✅ **Automatic Token Refresh** - Sessions update every 24 hours
✅ **30-day Sessions** - Configurable session expiration
✅ **Type-safe** - Full TypeScript support for user data
✅ **Scalable** - Easy to add OAuth providers later (Google, GitHub, etc.)
✅ **Automatic Logout** - Handles session expiration automatically

## Usage in Components:

```typescript
import { useAuth } from "@/hooks/use-auth";

export default function MyComponent() {
  const { session, isLoading, isAuthenticated, updateSession } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Welcome, {session?.user?.nickname}</p>
      <img src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${session?.user?.profileImg}`} />
    </div>
  );
}
```

## Next Steps:

1. Generate a secure `NEXTAUTH_SECRET` in production:
   ```bash
   openssl rand -base64 32
   ```

2. Update profile-related pages to use the session:
   - Remove localStorage usage where possible
   - Use `session.user` instead
   - Call `updateSession()` after profile updates

3. For OAuth integration (optional):
   - Install: `pnpm add next-auth @next-auth/prisma-adapter`
   - Add providers in `@/lib/auth.ts`

## Migration Notes:

- Login now uses `signIn()` from next-auth/react
- All user data is available from `session.user`
- Profile updates still save to backend, but now update the session
- localStorage can be gradually removed (use session instead)
