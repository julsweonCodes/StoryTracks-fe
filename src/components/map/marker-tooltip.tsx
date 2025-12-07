import { OverlayViewF, OverlayView } from "@react-google-maps/api";
import { memo, useMemo } from "react";

interface PostThumbnail {
  postId: number;
  title: string;
  src: string;
}

interface Props {
  position?: google.maps.LatLngLiteral | null;
  posts: PostThumbnail[];
  count: number;
  onMarkerClick?: () => void;
}

const MarkerTooltip = ({ position, posts, count, onMarkerClick }: Props) => {
  // Show only the first thumbnail
  const firstPost = useMemo(() => posts[0], [posts]);

  return position ? (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="group relative flex cursor-pointer flex-col items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onMarkerClick?.();
        }}
      >
        {/* Hover Tooltip - Shows single 1:1 image */}
        {firstPost?.src && (
          <div className="absolute bottom-full z-50 mb-2 hidden group-hover:block">
            <div className="h-32 w-32 overflow-hidden rounded-lg shadow-lg">
              <img
                src={firstPost.src}
                alt={firstPost.title}
                className="h-full w-full object-cover"
                onError={() => {
                  console.error("Image failed to load:", firstPost.src);
                }}
              />
            </div>
          </div>
        )}

        {/* Marker Badge */}
        <div className="flex items-center justify-center gap-1 transition-all">
          <div className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full border-[4px] border-white-primary bg-[#5946D4] transition-colors hover:bg-[#6b56f4]">
            {/* Surrounding glow ring on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                boxShadow: "0 0 0 10px rgba(89, 70, 212, 0.3)",
              }}
            />
            <span className="relative z-10 text-[14px] font-bold text-white-primary">
              {count}
            </span>
          </div>
          <div className="border-b-[10px] border-l-[6px] border-r-[6px] border-t-[10px] border-white-primary border-b-transparent border-l-transparent border-r-transparent" />
        </div>
      </div>
    </OverlayViewF>
  ) : null;
};

export default memo(MarkerTooltip);
