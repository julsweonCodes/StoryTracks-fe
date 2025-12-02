import {
  usePostsListQuery,
  mapToLatLng,
  processBlogs,
  ProcessedBlog,
} from "@/hooks/queries/use-posts-list-query";
import Card from "@/components/common/card";
import Drawer from "@/components/common/drawer";
import Header from "@/components/common/header";
import SEOHeader from "@/components/common/seo-header";
import Modal from "@/components/common/modal";
import Map from "@/components/map";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { IoAddCircle } from "react-icons/io5";

const formatNumber = (num?: number): string => {
  return num?.toLocaleString() || "0";
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedClusterPosts, setSelectedClusterPosts] = useState<
    ProcessedBlog[]
  >([]);
  const [selectedClusterInfo, setSelectedClusterInfo] = useState<{
    lat: number;
    lng: number;
    level?: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingInitialPosts, setIsLoadingInitialPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef<any>(null);
  const { data } = usePostsListQuery();
  const [processedData, setProcessedData] = useState<ProcessedBlog[]>([]);
  const [hasMoreInitialPages, setHasMoreInitialPages] = useState(false);
  const [initialPageNumber, setInitialPageNumber] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [clusters, setClusters] = useState<any[]>([]);
  const [maxZoom, setMaxZoom] = useState<number | null>(null);
  const [minZoom, setMinZoom] = useState<number | null>(null);

  // Determine zoom spectrum based on current zoom
  // Zoom spectrum 1 (zoom 0-4): Only cluster level 3
  // Zoom spectrum 2 (zoom 5-7): Only cluster level 2
  // Zoom spectrum 3 (zoom 8+): Only cluster level 1
  const getFilteredClusters = (allClusters: any[], zoom: number) => {
    let filtered: any[] = [];
    let level: number = 0;

    if (zoom <= 4) {
      // Spectrum 1: Only level 3 (continent)
      level = 3;
      filtered = allClusters.filter((c) => c.cluster_level === 3);
    } else if (zoom >= 5 && zoom <= 7) {
      // Spectrum 2: Only level 2 (country/region)
      level = 2;
      filtered = allClusters.filter((c) => c.cluster_level === 2);
    } else {
      // Spectrum 3: Only level 1 (city)
      level = 1;
      filtered = allClusters.filter((c) => c.cluster_level === 1);
    }

    // If no clusters at this level, show all clusters as fallback
    if (filtered.length === 0) {
      filtered = allClusters;
    }

    return filtered;
  };

  // Update zoom constraints based on current zoom level
  // Allow smooth transition between zoom spectrums
  useEffect(() => {
    if (currentZoom <= 4) {
      // Spectrum 1: Continent level (0-4)
      setMinZoom(0);
      setMaxZoom(7); // Allow zooming up to country level
    } else if (currentZoom >= 5 && currentZoom <= 7) {
      // Spectrum 2: Country/region level (5-7)
      setMinZoom(0); // Allow zooming down to continent
      setMaxZoom(12); // Allow zooming up to city level
    } else {
      // Spectrum 3: City level (8+)
      setMinZoom(5); // Allow zooming down to country
      setMaxZoom(18);
    }
  }, [currentZoom]);

  // Fetch backend clusters for main feed
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        // Fetch image clusters from backend
        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/google/clusters`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch clusters: ${response.status}`);
        }

        const data = await response.json();

        // Handle wrapped or direct response
        const clusterData = data.data || data || [];

        // Map cluster data - handle both camelCase and snake_case fields
        const mappedClusters = clusterData.map((c: any) => ({
          cluster_lat: c.cluster_lat || c.clusterLat || c.lat,
          cluster_long: c.cluster_long || c.clusterLong || c.lng,
          cluster_level: c.cluster_level || c.clusterLevel || c.level,
          image_count: c.image_count || c.imageCount || c.count || 0,
          thumb_img_path: c.thumb_img_path || c.thumbImgPath,
          ...c, // Keep all original fields
        }));

        setClusters(mappedClusters);
      } catch (error) {
        console.error("Error fetching clusters:", error);
      }
    };

    fetchClusters();
  }, []);

  const handleChange = () => {
    setIsOpen(!isOpen);
  };

  // Refresh feed - fetch fresh data from /posts/feed
  const handleRefreshFeed = async () => {
    try {
      setIsRefreshing(true);
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/feed?page=0`;
      const response = await axios.get(endpoint);
      const data = response.data;
      const newPosts = data.data?.content || data.content || data || [];

      if (newPosts && newPosts.length > 0) {
        const processed = await processBlogs(newPosts);
        setProcessedData(processed);
        setInitialPageNumber(1);
        // Check if there are more pages
        setHasMoreInitialPages(newPosts.length === 20);
      }
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load more posts from cluster when paginating
  const loadMoreClusterPosts = async (
    lat: number,
    lng: number,
    level: number,
    page: number,
  ) => {
    try {
      setIsLoadingMore(true);
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/marker?lat=${lat}&lng=${lng}&level=${level}&page=${page}`;

      const response = await axios.get(endpoint);
      const data = response.data;

      // Extract content from wrapped paginated response
      const newPosts = data.data?.content || data.content || data || [];

      if (newPosts && newPosts.length > 0) {
        const processed = await processBlogs(newPosts);
        // Append new posts to existing ones
        setSelectedClusterPosts((prev) => [...prev, ...processed]);
        setCurrentPage(page + 1);
      } else {
        // No more posts available
        setHasMorePages(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle cluster click based on zoom spectrum
  // Spectrum 1 (level 3): Zoom to level 2
  // Spectrum 2 (level 2): Zoom to level 1
  // Spectrum 3 (level 1): Fetch posts
  const handleClusterClick = async (cluster: any) => {
    try {
      // Spectrum 1: Level 3 cluster - zoom to level 2
      if (cluster.cluster_level === 3) {
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: cluster.cluster_lat,
            lng: cluster.cluster_long,
          });
          mapRef.current.setZoom(6);
        }
        return;
      }

      // Spectrum 2: Level 2 cluster - zoom to level 1
      if (cluster.cluster_level === 2) {
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: cluster.cluster_lat,
            lng: cluster.cluster_long,
          });
          mapRef.current.setZoom(10);
        }
        return;
      }

      // Spectrum 3: Level 1 cluster - fetch posts
      if (cluster.cluster_level === 1) {
        // Reset pagination state
        setCurrentPage(0);
        setHasMorePages(true);

        // API: /posts/marker?lat={lat}&lng={lng}&level={level}&page={page}
        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/marker?lat=${cluster.cluster_lat}&lng=${cluster.cluster_long}&level=${cluster.cluster_level}&page=0`;

        const response = await axios.get(endpoint);

        // Extract content from wrapped paginated response (data.data.content)
        const clusterPosts =
          response.data.data?.content ||
          response.data.content ||
          response.data ||
          [];

        if (clusterPosts && clusterPosts.length > 0) {
          const processed = await processBlogs(clusterPosts);
          setSelectedClusterPosts(processed);
          setSelectedClusterInfo({
            lat: cluster.cluster_lat,
            lng: cluster.cluster_long,
            level: cluster.cluster_level,
          });
          setCurrentPage(1); // First page loaded
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Error handling cluster click:", error);
    }
  };

  // Refetch cluster posts with updated like status
  const refetchClusterPosts = async () => {
    if (!selectedClusterInfo) return;

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/marker?lat=${selectedClusterInfo.lat}&lng=${selectedClusterInfo.lng}&level=${selectedClusterInfo.level}&page=0`;

      const response = await axios.get(endpoint);
      const clusterPosts =
        response.data.data?.content ||
        response.data.content ||
        response.data ||
        [];

      if (clusterPosts && clusterPosts.length > 0) {
        const processed = await processBlogs(clusterPosts);
        setSelectedClusterPosts(processed);
      }
    } catch (error) {
      console.error("Error refetching cluster posts:", error);
    }
  };

  // Refetch cluster posts when coming back from detail page
  useEffect(() => {
    const handleRouteChange = () => {
      // If we have selected cluster and drawer is open, refetch
      if (selectedClusterInfo && isOpen) {
        refetchClusterPosts();
      }
    };

    router.events?.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
    };
  }, [selectedClusterInfo, isOpen]);

  // Load more initial posts (when showing all posts, not from a cluster)
  const loadMoreInitialPosts = async (pageNum: number) => {
    try {
      setIsLoadingInitialPosts(true);
      // Use the same usePostsListQuery hook's endpoint pattern
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/feed?page=${pageNum}`;

      const response = await axios.get(endpoint);
      const data = response.data;
      const newPosts = data.data?.content || data.content || data || [];

      if (newPosts && newPosts.length > 0) {
        const processed = await processBlogs(newPosts);
        setProcessedData((prev) => [...prev, ...processed]);
        setInitialPageNumber(pageNum + 1);

        // Check if there are more pages (if returned count is less than expected page size)
        setHasMoreInitialPages(newPosts.length === 20); // Assuming page size is 20
      } else {
        setHasMoreInitialPages(false);
      }
    } catch (error) {
      console.error("Error loading more initial posts:", error);
    } finally {
      setIsLoadingInitialPosts(false);
    }
  };

  useEffect(() => {
    if (data) {
      processBlogs(data).then((processed) => {
        setProcessedData(processed);
        setHasMoreInitialPages(
          processed.length > 0 && processed.length % 20 === 0,
        );
        setInitialPageNumber(1);
      });
    }
  }, [data]);

  // Handle zoom changes and filter clusters accordingly
  const handleZoomChange = (zoom: number) => {
    setCurrentZoom(zoom);
  };

  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex h-full w-full flex-col">
      <SEOHeader
        title="Story Track - Discover and Share Your Stories"
        description="Welcome to Story Track, the ultimate platform for discovering, sharing, and keeping track of your stories. Join now 
         endless possibilities."
      />
      <div className="z-20">
        <Header />
      </div>
      <div className="relative flex h-full w-full flex-col overflow-visible">
        <div className="h-full w-full flex-1 overflow-hidden">
          {(() => {
            const filteredClusters = getFilteredClusters(clusters, currentZoom);
            return (
              <Map
                imageClusters={filteredClusters}
                zoom={currentZoom}
                useBackendClusters={true}
                onClusterClick={handleClusterClick}
                onZoomChange={handleZoomChange}
                mapRef={mapRef}
                maxZoom={maxZoom || 18}
                minZoom={minZoom || 0}
              />
            );
          })()}
        </div>
        <Drawer
          isOpen={isOpen}
          button={
            <div
              onClick={handleChange}
              className={`text-white flex h-[62px] cursor-pointer flex-col items-center justify-between ${isOpen ? "" : "rounded-t-3xl"} bg-black-primary px-4 py-2`}
            >
              <div className="h-[4px] w-[40px] rounded-full bg-white-primary" />
              <span className="text-[14px] text-white-primary">
                {formatNumber(
                  selectedClusterPosts.length > 0
                    ? selectedClusterPosts.length
                    : clusters.length,
                )}{" "}
                stories to explore
              </span>
            </div>
          }
          showRefetchButton={
            (selectedClusterPosts.length > 0 && hasMorePages) ||
            (selectedClusterPosts.length === 0 &&
              processedData.length > 0 &&
              hasMoreInitialPages)
          }
          isLoadingMore={isLoadingMore || isLoadingInitialPosts}
          onRefresh={handleRefreshFeed}
          isRefreshing={isRefreshing}
          onRefetch={() => {
            // If showing cluster posts, load more from cluster
            if (selectedClusterPosts.length > 0 && selectedClusterInfo) {
              loadMoreClusterPosts(
                selectedClusterInfo.lat,
                selectedClusterInfo.lng,
                selectedClusterInfo.level || 1,
                currentPage,
              );
            }
            // Otherwise load more initial posts
            else if (selectedClusterPosts.length === 0 && hasMoreInitialPages) {
              loadMoreInitialPosts(initialPageNumber);
            }
          }}
        >
          {(() => {
            const list =
              selectedClusterPosts.length > 0
                ? selectedClusterPosts
                : processedData;

            if (!list || list.length === 0) {
              return (
                <div className="flex h-56 w-full items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="mb-2">No stories found.</p>
                    <p className="text-sm">
                      Try refreshing the feed or clicking on a cluster.
                    </p>
                  </div>
                </div>
              );
            }

            return list.map((post, index) => (
              <Card
                key={index}
                id={post.postId}
                title={post.title}
                description={post.des}
                src={post.src}
                rgstDtm={post.rgstDtm}
                ogText={post.ogText}
                nickname={post.nickname}
                profileImg={post.profileImg}
                isLiked={post.isLiked}
                onLoginRequired={() => setIsLoginModalOpen(true)}
              />
            ));
          })()}
          {(isLoadingMore || isLoadingInitialPosts) && (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white-primary" />
            </div>
          )}
        </Drawer>
        {session && (
          <button
            onClick={() => router.push("/blog/new")}
            className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white-primary text-black-primary shadow-lg transition-all hover:bg-opacity-90 hover:shadow-xl"
            title="Create New Post"
          >
            <IoAddCircle size={32} />
          </button>
        )}
        <Modal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        >
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
    </div>
  );
}
