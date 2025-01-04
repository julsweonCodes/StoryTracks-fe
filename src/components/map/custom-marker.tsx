import { OverlayView } from "@react-google-maps/api";

interface Props {
  center: google.maps.LatLngLiteral;
}

export default function CustomMarker({ center }: Props) {
  return (
    <OverlayView
      position={center}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white p-2 text-center">
        🎯1
      </div>
    </OverlayView>
  );
}
