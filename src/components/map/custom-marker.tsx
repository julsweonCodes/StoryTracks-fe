import { OverlayView, OverlayViewF } from "@react-google-maps/api";
import { memo, useEffect, useState } from "react";

interface Props {
  position?: google.maps.LatLngLiteral | null;
  text?: string | number;
}

const CustomMarker = ({ position, text = 1 }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트된 후 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return position ? (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      // mapPaneName={OverlayView.OVERLAY_LAYER}
    >
      <div
        className={`relative flex items-center justify-center transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transformOrigin: "left center",
        }}
      >
        <div className="absolute top-[-40px] flex h-[42px] w-[42px] items-center justify-center rounded-full border-[4px] border-white-primary bg-[#5946D4]">
          <span className="text-[14px] font-bold">{text}</span>
        </div>
        <div className="border-b-[10px] border-l-[6px] border-r-[6px] border-t-[10px] border-white-primary border-b-transparent border-l-transparent border-r-transparent" />
      </div>
    </OverlayViewF>
  ) : null;
};

export default memo(CustomMarker);
