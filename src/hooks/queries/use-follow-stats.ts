import { useQuery } from "react-query";
import axios from "axios";

interface UserResponse {
  id: number;
  userId: string;
  nickname: string;
  email: string;
  blogName: string;
  bio: string;
  birthYmd: string;
  profileImg: string;
  rgstDtm: string;
  chngDtm: string;
}

// Get follower count for a specific user (viewing others' blogs)
export const useFollowerCount = (userId?: string) => {
  return useQuery<number>(
    ["follower-count", userId],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/followers/count`,
      );
      return response.data.data;
    },
    {
      enabled: !!userId,
    },
  );
};

// Get following count for a specific user (viewing others' blogs)
export const useFollowingCount = (userId?: string) => {
  return useQuery<number>(
    ["following-count", userId],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/following/count`,
      );
      return response.data.data;
    },
    {
      enabled: !!userId,
    },
  );
};

// Get my follower count (viewing own blog)
export const useMyFollowerCount = (enabled: boolean = false) => {
  return useQuery<number>(
    ["my-follower-count"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/followers/count`,
      );
      return response.data.data;
    },
    {
      enabled,
    },
  );
};

// Get my following count (viewing own blog)
export const useMyFollowingCount = (enabled: boolean = false) => {
  return useQuery<number>(
    ["my-following-count"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/following/count`,
      );
      return response.data.data;
    },
    {
      enabled,
    },
  );
};

// Get my followers list (viewing own blog)
export const useMyFollowers = (enabled: boolean = false) => {
  return useQuery<UserResponse[]>(
    ["my-followers"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/followers`,
      );
      return response.data.data;
    },
    {
      enabled,
    },
  );
};

// Get my following list (viewing own blog)
export const useMyFollowing = (enabled: boolean = false) => {
  return useQuery<UserResponse[]>(
    ["my-following"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/following`,
      );
      return response.data.data;
    },
    {
      enabled,
    },
  );
};
