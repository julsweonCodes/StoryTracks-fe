import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
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
          throw new Error("Invalid credentials");
        }

        try {
          const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
          console.log("[AUTH] BASE_URL:", BASE_URL);

          if (!BASE_URL) {
            console.error("[AUTH] BASE_URL not configured");
            throw new Error("Base URL not configured");
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
            try {
              const errorData = JSON.parse(responseText);
              throw new Error(
                errorData.data?.message || errorData.message || "Login failed"
              );
            } catch (parseError) {
              throw new Error(`Login failed: ${response.status}`);
            }
          }

          const loginData = JSON.parse(responseText);
          console.log("[AUTH] Login successful, user data:", {
            id: loginData.data?.id,
            userId: loginData.data?.userId,
            email: loginData.data?.email,
          });

          const userData = loginData.data;

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
          };

          console.log("[AUTH] Returning user object:", {
            id: user.id,
            userId: user.userId,
            email: user.email,
          });

          return user;
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
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
        token.id = user.id;
        token.userId = user.userId;
        token.email = user.email;
        token.nickname = user.nickname;
        token.bio = user.bio;
        token.blogName = user.blogName;
        token.birthYmd = user.birthYmd;
        token.profileImg = user.profileImg;
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
