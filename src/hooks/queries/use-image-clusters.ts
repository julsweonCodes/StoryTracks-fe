import { useState, useCallback } from "react";
import axios from "axios";

export interface ImageCluster {
  cluster_level: number | null;
  cluster_lat: number;
  cluster_long: number;
  image_count: number;
  thumb_img_path: string;
}

export interface UseImageClustersOptions {
  userId: number;
  enabled?: boolean;
}

/**
 * Determines cluster level based on zoom level
 * Zoom ≥ 12 → level 1 (city clusters)
 * Zoom 8–11 → level 2 (province clusters)
 * Zoom ≤ 7 → level 3 (country clusters)
 */
export const getClusterLevelFromZoom = (zoom: number): 1 | 2 | 3 => {
  if (zoom >= 12) return 1;
  if (zoom >= 8) return 2;
  return 3;
};

/**
 * Hook to fetch pre-aggregated image markers/clusters from backend
 * Uses the /image-markers endpoint which handles clustering on backend
 */
export const useImageClusters = (options: UseImageClustersOptions) => {
  const [clusters, setClusters] = useState<ImageCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClusters = useCallback(
    async (zoomLevel?: number) => {
      if (!options.enabled || options.userId <= 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Format: http://localhost:8080/api/v1/google/user-blog/{userId}/image-markers
        const endpoint = `/api/backend/google/user-blog/${options.userId}/image-markers`;

        // Fetch from backend - /image-markers endpoint handles all clustering
        const response = await axios.get(endpoint);

        const data = response.data;

        // Check if response indicates an error
        if (data.success === false) {
          console.warn(
            "[useImageClusters] Backend returned error:",
            data.message,
          );
          // Return empty clusters instead of throwing - graceful degradation
          setClusters([]);
          return;
        }

        const markerData = data.data || data || [];

        // Map camelCase response to snake_case interface
        const mappedClusters = markerData.map((m: any) => ({
          cluster_level: m.clusterLevel || null,
          cluster_lat: m.clusterLat,
          cluster_long: m.clusterLong,
          image_count: m.imageCount,
          thumb_img_path: m.thumbImgPath,
        }));

        // Validate marker structure
        const validatedClusters = mappedClusters.filter(
          (m: ImageCluster) =>
            m.cluster_lat !== undefined &&
            m.cluster_long !== undefined &&
            m.image_count !== undefined,
        );

        setClusters(validatedClusters);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[useImageClusters] Caught error:", errorMessage);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setClusters([]);
      } finally {
        setLoading(false);
      }
    },
    [options.userId, options.enabled],
  );

  return {
    clusters,
    loading,
    error,
    fetchClusters,
  };
};
