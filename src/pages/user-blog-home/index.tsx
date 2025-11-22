import {
  usePostsListQuery,
  mapToLatLng,
  processBlogs,
  ProcessedBlog,
} from "@/hooks/queries/use-posts-list-query";
import Card from "@/components/common/card";
import Header from "@/components/common/header";
import Map from "@/components/map";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const formatNumber = (num?: number): string => {
  return num?.toLocaleString() || "0";
};

const getLastActiveTime = (lastLoginDtm?: string): string => {
  if (!lastLoginDtm) return "recently active";

  try {
    const lastLogin = new Date(lastLoginDtm);
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return "recently active";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return lastLogin.toLocaleDateString();
  } catch {
    return "recently active";
  }
};

export default function UserBlogHome() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [blogName, setBlogName] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [lastLoginDtm, setLastLoginDtm] = useState<string>();
  const { data } = usePostsListQuery();
  const [userPosts, setUserPosts] = useState<ProcessedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);

  useEffect(() => {
    // Get user ID from router query parameter first (for viewing other blogs)
    // Fall back to localStorage userId (for viewing own blog from dropdown menu)
    const queryId = router.query.id as string;
    const localStorageId = localStorage.getItem("userId") || "";
    const idToUse = queryId || localStorageId;

    if (!idToUse) {
      router.push("/login");
      return;
    }

    setUserId(idToUse);
  }, [router, router.query]);

  // Fetch user blog data from backend
  useEffect(() => {
    if (!userId) return;

    const fetchUserBlogData = async () => {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/users/${userId}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          // Fallback to localStorage if API call fails
          const storedNickname = localStorage.getItem("nickname") || "";
          const storedBio = localStorage.getItem("userBio") || "";
          const storedBlogName = localStorage.getItem("userBlogName") || "";

          setUserNickname(storedNickname);
          setUserBio(storedBio);
          setBlogName(storedBlogName);
          setBlogLoading(false);
          return;
        }

        const userData = await response.json();
        const user = userData.data;

        setBlogName(user.blogName || "");
        setUserNickname(user.nickname || "");
        setUserBio(user.bio || "");
        setLastLoginDtm(user.lastLoginDtm);

        // Update localStorage with fresh data
        localStorage.setItem("nickname", user.nickname || "");
        localStorage.setItem("userBio", user.bio || "");
        localStorage.setItem("userBlogName", user.blogName || "");

        setBlogLoading(false);
      } catch (err) {
        console.error("Error fetching user blog data:", err);
        // Fallback to localStorage
        const storedNickname = localStorage.getItem("nickname") || "";
        const storedBio = localStorage.getItem("userBio") || "";
        const storedBlogName = localStorage.getItem("userBlogName") || "";

        setUserNickname(storedNickname);
        setUserBio(storedBio);
        setBlogName(storedBlogName);
        setBlogLoading(false);
      }
    };

    fetchUserBlogData();
  }, [userId]);

  useEffect(() => {
    if (data && userId && !blogLoading) {
      // Filter posts by current user (this would need backend support)
      // For now, showing all posts - you may need to create a separate endpoint
      processBlogs(data).then((processed) => {
        // Sort posts from recent to oldest
        const sortedPosts = processed.sort((a, b) => {
          const dateA = new Date(a.rgstDtm).getTime();
          const dateB = new Date(b.rgstDtm).getTime();
          return dateB - dateA;
        });
        setUserPosts(sortedPosts);
        setLoading(false);
      });
    }
  }, [data, userId, blogLoading]);

  const formatBirthDate = (birthYmd: string): string => {
    if (!birthYmd) return "";
    return `${birthYmd.slice(0, 4)}-${birthYmd.slice(4, 6)}-${birthYmd.slice(6, 8)}`;
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col bg-black-primary text-white-primary">
      <div className="z-20">
        <Header />
      </div>

      {loading || blogLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Loading blog...</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Main Content - Solid Page */}
          <div className="flex flex-1 flex-col bg-black-primary">
            {/* Blog Header Section */}
            <div className="border-b border-[#404040] px-4 py-8 sm:px-6">
              <h1 className="text-[32px] font-bold">{blogName}</h1>

              {/* User Info Line */}
              <div className="mt-3 flex items-center gap-2 text-[14px] text-gray-400">
                <span className="font-semibold text-white-primary">
                  {userNickname}
                </span>
                <span>•</span>
                <span>{getLastActiveTime(lastLoginDtm)}</span>
              </div>

              {/* Bio */}
              {userBio && (
                <p className="mt-4 text-[14px] leading-relaxed text-gray-300">
                  {userBio}
                </p>
              )}
            </div>

            {/* Small Faded Map */}
            <div className="relative h-[200px] w-full overflow-hidden border-b border-[#404040] opacity-30">
              <Map markers={mapToLatLng(data)} zoom={2} />
            </div>

            {/* Posts Count */}
            <div className="border-b border-[#404040] px-4 py-6 sm:px-6">
              <h2 className="text-[18px] font-bold">
                Posts{" "}
                <span className="text-[14px] text-gray-400">
                  ({userPosts.length})
                </span>
              </h2>
            </div>

            {/* Posts List Section */}
            <div className="flex-1 px-4 py-8 sm:px-6">
              {userPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="mb-4 text-gray-400">No posts yet</p>
                  <button
                    onClick={() => router.push("/blog/new")}
                    className="rounded-lg bg-key-primary px-6 py-2 font-bold text-[#0C0C0DB2] transition-opacity hover:opacity-90"
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {userPosts.map((post) => (
                    <Card
                      key={post.postId}
                      id={post.postId}
                      title={post.title}
                      description={post.des}
                      src={post.src}
                      rgstDtm={post.rgstDtm}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
