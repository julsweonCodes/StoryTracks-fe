import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import CustomMarker from "./custom-marker";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.579617,
  lng: 126.977041,
};

const mapStyles = [
  {
    featureType: "poi", // POI(관심 지점) 제거
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit", // 대중교통 관련 요소 제거
    stylers: [{ visibility: "off" }],
  },
  //   {
  //     featureType: "road", // 도로명 제거
  //     elementType: "labels",
  //     stylers: [{ visibility: "off" }],
  //   },
];

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter); // 중심 좌표
  const [userMarker, setUserMarker] =
    useState<google.maps.LatLngLiteral | null>(null); // 사용자 위치 마커
  const [zoom, setZoom] = useState(15); // 줌 레벨

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  //   const handleZoomIn = () => {
  //     setZoom(zoom + 1);
  //   };

  //   const handleZoomOut = () => {
  //     setZoom(zoom - 1);
  //   };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation); // 현재 위치를 중심으로 설정
          setUserMarker(userLocation); // 현재 위치에 마커 설정
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
      );
    }
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true, // 부가적인 UI 비활성화
        styles: mapStyles,
      }}
    >
      {/* <div className="absolute left-4 top-4 flex flex-col gap-5">
        <button
          onClick={handleZoomIn}
          className="rounded-md border border-gray-300 bg-white px-4 py-2"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-md border border-gray-300 bg-white px-4 py-2"
        >
          Zoom Out
        </button>
      </div> */}
      <CustomMarker center={userMarker} />
    </GoogleMap>
  ) : (
    <></>
  );
}
