import { OverlayView } from "@react-google-maps/api";

interface Props {
  center?: google.maps.LatLngLiteral | null;
}

export default function CustomMarker({ center }: Props) {
  return center ? (
    <OverlayView
      position={center}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="bg-black-primary flex h-12 w-12 items-center justify-center rounded-full border-2 border-black p-2 text-center text-2xl">
        🎯
      </div>
    </OverlayView>
  ) : null;
}
