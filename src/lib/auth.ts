import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        console.log("[AUTH] authorize() called");
        console.log("[AUTH] credentials received:", {
          userId: credentials?.userId,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.userId || !credentials?.password) {
          console.error("[AUTH] Missing userId or password");
          return null;
        }

        try {
          const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
          console.log("[AUTH] BASE_URL:", BASE_URL);

          if (!BASE_URL) {
            console.error("[AUTH] BASE_URL not configured");
            return null;
          }

          const loginUrl = `${BASE_URL}/users/login`;
          console.log("[AUTH] Making request to:", loginUrl);

          const requestBody = {
            userId: credentials.userId,
            pwd: credentials.password,
          };
          console.log("[AUTH] Request body:", {
            userId: credentials.userId,
            pwd: "***",
          });

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          console.log("[AUTH] Response status:", response.status);
          const responseText = await response.text();
          console.log("[AUTH] Response body:", responseText);

          if (!response.ok) {
            console.error("[AUTH] Login failed with status:", response.status);
            return null;
          }

          const loginData = JSON.parse(responseText);
          console.log("[AUTH] Login successful, user data:", {
            id: loginData.data?.user?.id,
            userId: loginData.data?.user?.userId,
            email: loginData.data?.user?.email,
            hasToken: !!loginData.data?.token,
          });

          const userData = loginData.data.user;
          const token = loginData.data.token;

          // Return user object with all necessary fields
          const user = {
            id: userData.id,
            userId: userData.userId,
            email: userData.email,
            nickname: userData.nickname,
            bio: userData.bio || "",
            blogName: userData.blogName || "",
            birthYmd: userData.birthYmd || "",
            profileImg: userData.profileImg || "",
            // Include JWT token if returned by backend
            token: token || "",
          };

          console.log("[AUTH] Returning user object:", {
            id: user.id,
            userId: user.userId,
            email: user.email,
          });

          return user;
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // Add user data to token on initial login
      if (user) {
        console.log("[JWT_CALLBACK] User object received:", {
          id: user.id,
          userId: user.userId,
          token: user.token ? "***" : "NO TOKEN",
        });
        token.id = user.id;
        token.userId = user.userId;
        token.email = user.email;
        token.nickname = user.nickname;
        token.bio = user.bio;
        token.blogName = user.blogName;
        token.birthYmd = user.birthYmd;
        token.profileImg = user.profileImg;
        // Store JWT token from backend
        token.jwt = user.token || user.jwt || "";
        console.log(
          "[JWT_CALLBACK] Token set in JWT callback:",
          token.jwt ? "***" : "EMPTY",
        );
      }

      // Update token when session is updated (from client-side update() call)
      if (trigger === "update" && session) {
        token.nickname = session.nickname;
        token.bio = session.bio;
        token.blogName = session.blogName;
        token.profileImg = session.profileImg;
      }

      return token;
    },
    async session({ session, token }: any) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
        session.user.nickname = token.nickname as string;
        session.user.bio = token.bio as string;
        session.user.blogName = token.blogName as string;
        session.user.birthYmd = token.birthYmd as string;
        session.user.profileImg = token.profileImg as string;
      }
      // Expose the JWT token in session for API requests
      session.token = token.jwt || token.access_token || "";
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
