import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { memo, useMemo, useState } from "react";
import { ImageCluster } from "@/hooks/queries/use-image-clusters";

interface Props {
  cluster: ImageCluster;
  onClusterClick?: (cluster: ImageCluster) => void;
  onlyLevel3Clickable?: boolean; // If true, only level 3 is clickable (for user-blog)
}

/**
 * Calculate marker size based on cluster coverage
 * Approximate radius in pixels to cover cluster area
 */
const calculateMarkerSize = (imageCount: number): number => {
  // Base 40px, scales logarithmically to 100px max
  const baseSize = 40;
  const maxSize = 100;
  const scaleFactor = Math.log(imageCount + 1) * 8;
  return Math.min(baseSize + scaleFactor, maxSize);
};

const ClusterMarker = memo(({ cluster, onClusterClick, onlyLevel3Clickable = false }: Props) => {
  // Validate coordinates
  const lat = Number(cluster.cluster_lat);
  const lng = Number(cluster.cluster_long);

  if (!isFinite(lat) || !isFinite(lng)) {
    return null; // Don't render if coordinates are invalid
  }

  const markerSize = useMemo(
    () => calculateMarkerSize(cluster.image_count),
    [cluster.image_count],
  );

  const [isLoading, setIsLoading] = useState(false);

  // Determine if this cluster is clickable
  // If onlyLevel3Clickable is true, only level 3 is clickable (user-blog)
  // Otherwise, all levels are clickable (main feed)
  const isClickable = onlyLevel3Clickable ? cluster.cluster_level === 3 : true;

  // Get color based on cluster level
  const getClusterColor = () => {
    if (isLoading) {
      return isClickable
        ? "rgba(89, 70, 212, 0.5)" // Purple loading for clickable
        : "rgba(156, 163, 175, 0.5)"; // Gray loading for non-clickable
    }

    switch (cluster.cluster_level) {
      case 3: // Neighborhood-level - Clickable
        return "rgba(89, 70, 212, 0.9)"; // Purple
      case 1: // City-level
      case 2: // District-level
      default:
        return "rgba(156, 163, 175, 0.7)"; // Gray
    }
  };

  const handleClick = () => {
    if (!isClickable) return; // Prevent clicking on non-level-1 clusters
    setIsLoading(true);
    onClusterClick?.(cluster);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const position = { lat, lng };

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={handleClick}
        className={`relative flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center transition-transform ${
          isClickable
            ? "cursor-pointer hover:scale-110"
            : "cursor-not-allowed opacity-60"
        }`}
        style={{
          width: markerSize,
          height: markerSize,
        }}
        title={`${cluster.image_count} images - Level ${cluster.cluster_level}${isClickable ? " (Click to view)" : " (Not clickable)"}`}
      >
        {/* Circle background */}
        <div
          className="absolute inset-0 rounded-full border-4 border-white-primary transition-all"
          style={{
            backgroundColor: getClusterColor(),
            borderColor: isClickable ? "#FFFFFF" : "#CCCCCC",
            boxShadow: isClickable
              ? "0 4px 12px rgba(89, 70, 212, 0.4)"
              : "none",
          }}
        />

        {/* Count text */}
        <span className="relative z-10 text-center font-bold text-white-primary">
          {cluster.image_count > 99 ? "99+" : cluster.image_count}
        </span>
      </div>
    </OverlayViewF>
  );
});

ClusterMarker.displayName = "ClusterMarker";

export default ClusterMarker;
