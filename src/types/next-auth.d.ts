import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    userId: string;
    nickname: string;
    bio: string;
    blogName: string;
    birthYmd: string;
    profileImg: string;
  }

  interface Session {
    user: User & {
      email: string;
      image?: string;
    };
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userId: string;
    email: string;
    nickname: string;
    bio: string;
    blogName: string;
    birthYmd: string;
    profileImg: string;
  }
}
