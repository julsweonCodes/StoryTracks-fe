import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the current JWT token
    const token = await getToken({ req, secret });

    if (!token?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = token.id;

    // Fetch fresh user data from backend
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!backendUrl) {
      return res.status(500).json({ error: "Backend URL not configured" });
    }

    const response = await fetch(`${backendUrl}/users/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch user data" });
    }

    const userData = await response.json();
    const user = userData.data;

    // Return the fresh user data with all fields
    const freshUserData = {
      id: user.id,
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
      bio: user.bio || "",
      blogName: user.blogName || "",
      birthYmd: user.birthYmd || "",
      profileImg: user.profileImg || "",
    };

    return res.status(200).json(freshUserData);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
