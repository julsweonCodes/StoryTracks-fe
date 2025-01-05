import { OverlayView } from "@react-google-maps/api";
import { memo } from "react";

interface Props {
  position?: google.maps.LatLngLiteral | null;
  text?: string | number;
}

const CustomMarker = ({ position, text = 1 }: Props) => {
  return position ? (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute top-[-40px] flex h-[42px] w-[42px] items-center justify-center rounded-full border-[4px] border-white-primary bg-[#5946D4]">
          <span className="text-[14px] font-bold">{text}</span>
        </div>
        <div className="border-b-[10px] border-l-[6px] border-r-[6px] border-t-[10px] border-white-primary border-b-transparent border-l-transparent border-r-transparent" />
      </div>
    </OverlayView>
  ) : null;
};

export default memo(CustomMarker);
