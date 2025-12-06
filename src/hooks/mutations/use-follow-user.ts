import { useMutation, UseMutationOptions } from "react-query";
import axios from "axios";

interface FollowUserParams {
  userId: number;
  isCurrentlyFollowing: boolean;
}

/**
 * Hook to follow/unfollow a user
 * POST /api/v1/users/{userId}/follow - Follow user
 * DELETE /api/v1/users/{userId}/follow - Unfollow user
 */
const useFollowUser = (
  options?: UseMutationOptions<void, Error, FollowUserParams>,
) => {
  return useMutation({
    mutationFn: async ({ userId, isCurrentlyFollowing }: FollowUserParams) => {
      const endpoint = `/api/backend/users/${userId}/follow`;

      if (isCurrentlyFollowing) {
        // Unfollow
        await axios.delete(endpoint);
      } else {
        // Follow
        await axios.post(endpoint);
      }
    },
    ...options,
  });
};

export default useFollowUser;
