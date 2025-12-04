import UserBlogCard from "@/components/common/user-blog-card";
import Header from "@/components/common/header";
import Map from "@/components/map";
import Modal from "@/components/common/modal";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import { useSession } from "next-auth/react";
import { markdownToPlainText } from "@/utils/markdown-to-plain-text";
import { fetchPostsByGeoLocation } from "@/hooks/utils/geo-query";
import {
  useImageClusters,
  type ImageCluster,
} from "@/hooks/queries/use-image-clusters";

interface ProcessedBlog {
  postId: number;
  title: string;
  src: string;
  des: string;
  rgstDtm: string;
  lat?: number;
  lng?: number;
  isLiked?: boolean;
}

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

// Map processor for blog locations - returns full blog data for markers
const mapToLatLng = (blogs: ProcessedBlog[]) => {
  return (
    blogs
      ?.filter((blog) => {
        // Only include blogs with valid src (has image path beyond just the S3 base URL)
        return blog.src && blog.src.length > 0 && blog.lat && blog.lng;
      })
      .map((blog) => ({
        lat: blog.lat || 37.7749,
        lng: blog.lng || -122.4194,
        postId: blog.postId,
        title: blog.title,
        src: blog.src,
        des: blog.des,
      })) || []
  );
};

// Helper function to estimate city name from coordinates
// Uses a simple lookup table for common coordinates
const estimateCityFromCoords = (lat: number, lng: number): string => {
  // Common coordinate ranges for major cities
  const cities = [
    { name: "Seoul", latMin: 37.4, latMax: 37.7, lngMin: 126.7, lngMax: 127.2 },
    {
      name: "Vancouver",
      latMin: 49.2,
      latMax: 49.35,
      lngMin: -123.25,
      lngMax: -123.0,
    },
    {
      name: "Toronto",
      latMin: 43.6,
      latMax: 43.85,
      lngMin: -79.5,
      lngMax: -79.0,
    },
    {
      name: "New York",
      latMin: 40.5,
      latMax: 40.95,
      lngMin: -74.3,
      lngMax: -73.7,
    },
    {
      name: "Los Angeles",
      latMin: 33.8,
      latMax: 34.35,
      lngMin: -118.7,
      lngMax: -117.8,
    },
    {
      name: "San Francisco",
      latMin: 37.7,
      latMax: 37.85,
      lngMin: -122.5,
      lngMax: -122.3,
    },
    { name: "London", latMin: 51.3, latMax: 51.7, lngMin: -0.35, lngMax: 0.05 },
    { name: "Paris", latMin: 48.8, latMax: 49.0, lngMin: 2.2, lngMax: 2.5 },
    {
      name: "Tokyo",
      latMin: 35.5,
      latMax: 35.75,
      lngMin: 139.6,
      lngMax: 139.9,
    },
  ];

  const matchedCity = cities.find(
    (city) =>
      lat >= city.latMin &&
      lat <= city.latMax &&
      lng >= city.lngMin &&
      lng <= city.lngMax,
  );

  if (matchedCity) {
    return matchedCity.name;
  }

  // If no match, return generic area description based on coordinates
  return `Area (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
};

export default function UserBlogHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [userId, setUserId] = useState("");
  const [userNumId, setUserNumId] = useState<number | null>(null);
  const [blogName, setBlogName] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [lastLoginDtm, setLastLoginDtm] = useState<string>();
  const [userPosts, setUserPosts] = useState<ProcessedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();
  const [isViewingOwnBlog, setIsViewingOwnBlog] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [selectedClusterPosts, setSelectedClusterPosts] = useState<
    ProcessedBlog[]
  >([]);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [selectedImageCluster, setSelectedImageCluster] =
    useState<ImageCluster | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "marker">("all"); // Toggle between all posts and marker posts
  const [selectedClusterCity, setSelectedClusterCity] = useState<string>("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch image clusters from backend
  const {
    clusters: imageClusters,
    loading: clustersLoading,
    fetchClusters,
  } = useImageClusters({
    userId: userNumId || 0,
    enabled: userNumId !== null && userNumId > 0,
  });

  // Log when clusters change
  useEffect(() => {
    console.log(
      "%c[UserBlogHome] ImageClusters Updated",
      "background: #E91E63; color: white; padding: 5px 10px; border-radius: 3px;",
      {
        length: imageClusters.length,
        loading: clustersLoading,
        first_cluster: imageClusters[0],
      },
    );
  }, [imageClusters, clustersLoading]);

  useEffect(() => {
    // Get user ID from router query parameter first (for viewing other blogs)
    // Fall back to session userId (for viewing own blog from dropdown menu)
    const queryId = router.query.id as string;
    const sessionId = session?.user?.userId || "";
    const idToUse = queryId || sessionId;

    console.log("[UserBlogHome] Session status:", status);
    console.log("[UserBlogHome] Session data:", {
      userId: session?.user?.userId,
      id: session?.user?.id,
    });
    console.log("[UserBlogHome] Query ID:", queryId);
    console.log("[UserBlogHome] idToUse:", idToUse);

    // Don't redirect if status is still loading
    if (status === "loading") {
      console.log("[UserBlogHome] Session still loading, waiting...");
      return;
    }

    if (!idToUse) {
      console.log("[UserBlogHome] No user ID found, redirecting to login");
      router.push("/login");
      return;
    }

    const viewing = isLoggedIn && session?.user?.userId === idToUse;
    setIsViewingOwnBlog(viewing);
    setUserId(idToUse);

    // If viewing own blog, get numeric ID from session
    if (viewing && session?.user?.id) {
      setUserNumId(Number(session.user.id));
    }
  }, [router, router.query, session, isLoggedIn, status]);

  // Fetch user blog data and posts from backend
  useEffect(() => {
    if (!userId) return;

    const fetchUserBlogData = async () => {
      try {
        setBlogLoading(true);
        setLoading(true);

        // If viewing own blog, use session data for profile
        if (isViewingOwnBlog && isLoggedIn && session?.user) {
          setBlogName(session.user.blogName || "");
          setUserNickname(session.user.nickname || "");
          setUserBio(session.user.bio || "");
          setProfileImg(session.user.profileImg || null);
          setConfig(genConfig(session.user.nickname || "User"));
        } else {
          // Fetch profile data from the general profile endpoint
          const profileResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/profile`,
          );

          if (profileResponse.status === 200) {
            const userData = profileResponse.data;
            const user = userData.data;
            setBlogName(user.blogName || "");
            setUserNickname(user.nickname || "");
            setUserBio(user.bio || "");
            setProfileImg(user.profileImg || null);
            setLastLoginDtm(user.lastLoginDtm);
            setConfig(genConfig(user.nickname || "User"));

            // Store numeric ID for posts endpoint
            if (user.id) {
              setUserNumId(user.id);
            }
          }
        }

        setBlogLoading(false);

        // Fetch posts using numeric ID
        const numericId = isViewingOwnBlog ? userNumId : null;

        if (!numericId && isViewingOwnBlog) {
          // Wait for userNumId to be set
          return;
        }

        const id = isViewingOwnBlog ? userNumId : router.query.id;
        if (!id) return;

        const endpoint = isViewingOwnBlog
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/user-blog/${id}/my-blog-home`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/user-blog/${id}/blog-home`;

        const postsResponse = await axios.get(endpoint);

        if (postsResponse.status === 200) {
          const postsData = postsResponse.data;

          // Extract posts from response based on endpoint
          let blogs = [];
          if (isViewingOwnBlog) {
            // MyBlogResponse: { totalPages, currentPage, posts }
            blogs = postsData.data?.posts || [];
          } else {
            // UserBlogHomeResponse: { id, nickname, blogName, bio, profileImg, lastLoginDtm, totalPages, currentPage, posts }
            blogs = postsData.data?.posts || [];

            // If viewing other's blog, also extract profile info from response
            if (postsData.data) {
              setBlogName(postsData.data.blogName || "");
              setUserNickname(postsData.data.nickname || "");
              setUserBio(postsData.data.bio || "");
              setProfileImg(postsData.data.profileImg || null);
              setLastLoginDtm(postsData.data.lastLoginDtm);
              setConfig(genConfig(postsData.data.nickname || "User"));
            }
          }

          // Process blogs
          const processedBlogs = await Promise.all(
            blogs.map(async (blog: any) => {
              // Try to get thumbnail from thumbHash first (if backend provides it)
              let thumbPath = blog.thumbHash?.thumbImgPath || "";
              let thumbLat = blog.thumbHash?.thumbGeoLat;
              let thumbLng = blog.thumbHash?.thumbGeoLong;

              // Fallback: Extract featured image from blogImgList if thumbHash is empty
              if (
                !thumbPath &&
                blog.blogImgList &&
                Array.isArray(blog.blogImgList)
              ) {
                // Find image with thumbYn === true or thumbYn === "Y"
                const featuredImage = blog.blogImgList.find(
                  (img: any) => img.thumbYn === true || img.thumbYn === "Y",
                );

                if (featuredImage) {
                  thumbPath = featuredImage.imgPath || "";
                  thumbLat = featuredImage.geoLat;
                  thumbLng = featuredImage.geoLong;

                  console.log("Blog thumbnail (from blogImgList):", {
                    postId: blog.postId,
                    thumbPath,
                    thumbYn: featuredImage.thumbYn,
                    hasGeo: !!(thumbLat || thumbLng),
                  });
                }
              } else if (thumbPath) {
                console.log("Blog thumbnail (from thumbHash):", {
                  postId: blog.postId,
                  thumbPath,
                  hasGeo: !!thumbLat,
                });
              }

              // Ensure thumbPath has posts/ prefix
              let fullThumbPath = thumbPath;
              if (thumbPath && !thumbPath.startsWith("posts/")) {
                fullThumbPath = "posts/" + thumbPath;
              }

              const fullSrc = `${process.env.NEXT_PUBLIC_S3_BASE_URL}${fullThumbPath}`;

              return {
                postId: blog.postId,
                title: blog.title,
                src: fullSrc,
                des: await markdownToPlainText(blog.aiGenText),
                rgstDtm: blog.rgstDtm,
                lat: thumbLat ? parseFloat(thumbLat) : undefined,
                lng: thumbLng ? parseFloat(thumbLng) : undefined,
                isLiked: blog.isLiked,
              };
            }),
          );

          // Sort posts from recent to oldest
          const sortedPosts = processedBlogs.sort((a, b) => {
            const dateA = new Date(a.rgstDtm).getTime();
            const dateB = new Date(b.rgstDtm).getTime();
            return dateB - dateA;
          });

          setUserPosts(sortedPosts);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user blog data:", err);
        setLoading(false);
        setBlogLoading(false);
      }
    };

    fetchUserBlogData();
  }, [
    userId,
    isViewingOwnBlog,
    isLoggedIn,
    session,
    userNumId,
    router.query.id,
    refetchTrigger,
  ]);

  // Update map center to focus on the latest post
  useEffect(() => {
    if (userPosts.length > 0) {
      const latestPost = userPosts[0];
      if (latestPost.lat && latestPost.lng) {
        setMapCenter({
          lat: latestPost.lat,
          lng: latestPost.lng,
        });
      }
    }
  }, [userPosts]);

  // Refetch user posts when returning from detail page to update like status
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Only refetch if we're on the user-blog-home page (not navigating away)
      if (url.includes("/user-blog-home")) {
        // Trigger refetch by incrementing trigger
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    router.events?.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Fetch image markers/clusters once when userId is set
  useEffect(() => {
    console.log(
      "%c[UserBlogHome] Image Markers Fetch",
      "background: #9C27B0; color: white; padding: 5px 10px; border-radius: 3px;",
      {
        userNumId,
        will_fetch: !!(userNumId && userNumId > 0),
      },
    );

    if (userNumId && userNumId > 0) {
      console.log(
        `%c[UserBlogHome] Calling fetchClusters()`,
        "background: #673AB7; color: white; padding: 3px 8px; border-radius: 3px;",
      );
      fetchClusters();
    }
  }, [userNumId, fetchClusters]);

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
            <div className="relative h-[200px] w-full overflow-hidden border-b border-[#404040]">
              {(() => {
                console.log(
                  "%c[UserBlogHome] Map Props",
                  "background: #FF5722; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;",
                  {
                    useBackendClusters: true,
                    imageClusters_length: imageClusters.length,
                    imageClusters: imageClusters.slice(0, 3), // Show first 3
                  },
                );
                return null;
              })()}
              <Map
                markers={mapToLatLng(userPosts)}
                imageClusters={imageClusters}
                zoom={9}
                center={mapCenter}
                useBackendClusters={true}
                onClusterClick={(cluster) => {
                  // Only allow click on city-level clusters (level 1)
                  if (cluster.cluster_level === 1) {
                    setSelectedImageCluster(cluster);
                    setViewMode("marker");
                  }
                }}
                onMarkerClick={async (lat, lng, posts) => {
                  // Fallback: Use local posts from current userPosts
                  // This works if all posts are already loaded
                  const matchedPosts = userPosts.filter((post) =>
                    posts.some((p: any) => p.postId === post.postId),
                  );

                  // Estimate city name from coordinates
                  const cityName = estimateCityFromCoords(lat, lng);

                  // Fetch posts in marker area and toggle view
                  setSelectedClusterPosts(matchedPosts);
                  setSelectedClusterCity(cityName);
                  setViewMode("marker");
                }}
              />
            </div>

            {/* Posts Count with Toggle */}
            <div className="border-b border-[#404040] px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold">
                  {viewMode === "all"
                    ? "Posts"
                    : `Posts in ${selectedClusterCity || "this area"}`}{" "}
                  <span className="text-[14px] text-gray-400">
                    (
                    {viewMode === "all"
                      ? userPosts.length
                      : selectedClusterPosts.length}
                    )
                  </span>
                </h2>
                {viewMode === "marker" && (
                  <button
                    onClick={() => {
                      setViewMode("all");
                      setSelectedClusterPosts([]);
                      setSelectedImageCluster(null);
                      setSelectedClusterCity("");
                    }}
                    className="rounded-lg bg-key-primary px-4 py-2 text-sm font-semibold text-black-primary transition-opacity hover:opacity-90"
                  >
                    Show All Posts
                  </button>
                )}
              </div>
            </div>

            {/* Posts List Section */}
            <div className="flex-1 px-4 py-8 sm:px-6">
              {(viewMode === "all" ? userPosts : selectedClusterPosts)
                .length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="mb-4 text-gray-400">
                    {viewMode === "all"
                      ? "No posts yet"
                      : "No posts in this area"}
                  </p>
                  {viewMode === "all" && (
                    <button
                      onClick={() => router.push("/blog/new")}
                      className="rounded-lg bg-key-primary px-6 py-2 font-bold text-[#0C0C0DB2] transition-opacity hover:opacity-90"
                    >
                      Create Your First Post
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {(viewMode === "all" ? userPosts : selectedClusterPosts).map(
                    (post) => (
                      <UserBlogCard
                        key={post.postId}
                        id={post.postId}
                        title={post.title}
                        description={post.des}
                        src={post.src}
                        rgstDtm={post.rgstDtm}
                        nickname={userNickname}
                        profileImg={profileImg || undefined}
                        blogName={post.blogName}
                        isLiked={post.isLiked}
                        isFollowing={post.isFollowing}
                        onLoginRequired={() => setIsLoginModalOpen(true)}
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Image Cluster Info Overlay - Position fixed over the map */}
            {selectedImageCluster && viewMode === "marker" && (
              <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-end pr-6 pt-24">
                <div className="pointer-events-auto w-80 rounded-lg bg-black-secondary p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white-primary">
                      Cluster Details
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedImageCluster(null);
                        setViewMode("all");
                        setSelectedClusterPosts([]);
                      }}
                      className="text-gray-400 transition-colors hover:text-white-primary"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Thumbnail */}
                  {selectedImageCluster.thumb_img_path && (
                    <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg">
                      <img
                        src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${selectedImageCluster.thumb_img_path}`}
                        alt="Cluster thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Cluster Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Images:</span>
                      <span className="font-bold text-white-primary">
                        {selectedImageCluster.image_count}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Coordinates:</span>
                      <span className="text-xs font-bold text-white-primary">
                        {selectedImageCluster.cluster_lat.toFixed(4)},
                        {selectedImageCluster.cluster_long.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Modal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
        <div className="flex flex-col items-center gap-4 p-6">
          <h2 className="text-xl font-bold text-white-primary">
            Login Required
          </h2>
          <p className="text-center text-gray-400">
            Please log in to like posts.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-lg bg-white-primary px-6 py-2 text-black-primary transition-all hover:bg-opacity-90"
          >
            Go to Login
          </button>
        </div>
      </Modal>
    </div>
  );
}
