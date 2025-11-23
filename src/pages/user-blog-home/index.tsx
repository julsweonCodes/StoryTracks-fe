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
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  const [userId, setUserId] = useState("");
  const [blogName, setBlogName] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [lastLoginDtm, setLastLoginDtm] = useState<string>();
  const { data } = usePostsListQuery();
  const [userPosts, setUserPosts] = useState<ProcessedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  useEffect(() => {
    // Get user ID from router query parameter first (for viewing other blogs)
    // Fall back to session userId (for viewing own blog from dropdown menu)
    const queryId = router.query.id as string;
    const sessionId = session?.user?.userId || "";
    const idToUse = queryId || sessionId;

    if (!idToUse) {
      router.push("/login");
      return;
    }

    setUserId(idToUse);
  }, [router, router.query, session]);

  // Fetch user blog data from backend
  useEffect(() => {
    if (!userId) return;

    // If viewing own blog and logged in, use session data
    if (isLoggedIn && session?.user?.userId === userId) {
      console.log("[USER_BLOG_HOME] Using session data for own blog");
      setBlogName(session.user.blogName || "");
      setUserNickname(session.user.nickname || "");
      setUserBio(session.user.bio || "");
      setProfileImg(session.user.profileImg || null);
      setConfig(genConfig(session.user.nickname || "User"));
      setBlogLoading(false);
      return;
    }

    // Otherwise, fetch from backend
    const fetchUserBlogData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          // Fallback to session if available
          if (isLoggedIn && session?.user) {
            setUserNickname(session.user.nickname || "");
            setUserBio(session.user.bio || "");
            setBlogName(session.user.blogName || "");
            setProfileImg(session.user.profileImg || null);
            setConfig(genConfig(session.user.nickname || "User"));
          }
          setBlogLoading(false);
          return;
        }

        const userData = await response.json();
        const user = userData.data;

        setBlogName(user.blogName || "");
        setUserNickname(user.nickname || "");
        setUserBio(user.bio || "");
        setProfileImg(user.profileImg || null);
        setLastLoginDtm(user.lastLoginDtm);
        setConfig(genConfig(user.nickname || "User"));

        setBlogLoading(false);
      } catch (err) {
        console.error("Error fetching user blog data:", err);
        // Fallback to session
        if (isLoggedIn && session?.user) {
          setUserNickname(session.user.nickname || "");
          setUserBio(session.user.bio || "");
          setBlogName(session.user.blogName || "");
          setProfileImg(session.user.profileImg || null);
          setConfig(genConfig(session.user.nickname || "User"));
        }
        setBlogLoading(false);
      }
    };

    fetchUserBlogData();
  }, [userId, isLoggedIn, session]);

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

              {/* User Info with Profile Image */}
              <div className="mt-6 flex items-start gap-4">
                {/* Profile Image - 1:1 Square */}
                <div className="relative h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                  {profileImg ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${profileImg}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    config && <Avatar className="h-full w-full" {...config} />
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-1 flex-col justify-center">
                  {/* User Info Line */}
                  <div className="flex items-center gap-2 text-[14px] text-gray-400">
                    <span className="font-semibold text-white-primary">
                      {userNickname}
                    </span>
                    <span>•</span>
                    <span>{getLastActiveTime(lastLoginDtm)}</span>
                  </div>

                  {/* Bio */}
                  {userBio && (
                    <p className="mt-2 text-[14px] leading-relaxed text-gray-300">
                      {userBio}
                    </p>
                  )}
                </div>
              </div>
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
