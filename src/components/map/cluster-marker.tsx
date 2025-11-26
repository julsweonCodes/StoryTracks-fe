import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { memo, useMemo, useState } from "react";
import { ImageCluster } from "@/hooks/queries/use-image-clusters";

interface Props {
  cluster: ImageCluster;
  onClusterClick?: (cluster: ImageCluster) => void;
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

const ClusterMarker = memo(({ cluster, onClusterClick }: Props) => {
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

  const handleClick = () => {
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
        className="relative flex -translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center justify-center"
        style={{
          width: markerSize,
          height: markerSize,
        }}
        title={`${cluster.image_count} images - Level ${cluster.cluster_level}`}
      >
        {/* Circle background */}
        <div
          className="absolute inset-0 rounded-full border-4 border-white-primary transition-opacity"
          style={{
            backgroundColor: isLoading
              ? "rgba(89, 70, 212, 0.5)"
              : "rgba(89, 70, 212, 0.8)",
            borderColor: "#FFFFFF",
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
