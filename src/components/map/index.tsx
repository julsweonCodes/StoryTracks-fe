import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import CustomMarker from "./custom-marker";
import { BiSolidNavigation } from "react-icons/bi";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.579617,
  lng: 126.977041,
};

const mapStyles = [
  // {
  //   featureType: "poi", // POI(관심 지점) 제거
  //   stylers: [{ visibility: "off" }],
  // },
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

  // const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter); // 중심 좌표
  const [userMarker, setUserMarker] =
    useState<google.maps.LatLngLiteral | null>(null); // 사용자 위치 마커
  const [zoom] = useState(15); // 줌 레벨
  const [isDragging, setIsDragging] = useState(false);
  const lastValidPosition = useRef(defaultCenter);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        lastValidPosition.current = {
          lat: center.lat(),
          lng: center.lng(),
        };
      }
    }
    setTimeout(() => setIsDragging(false), 0);
  }, []);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

  const moveToCurrentLocation = () => {
    if (mapRef.current && userMarker) {
      mapRef.current.panTo(userMarker);
      mapRef.current.setZoom(zoom);
    }
  };

  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      // init location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation);
          setUserMarker(userLocation);
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
      );

      watchId = navigator.geolocation.watchPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserMarker(userLocation);
      });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
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
      <button
        className="absolute right-5 top-5 flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-white-primary"
        onClick={moveToCurrentLocation}
        aria-label="move to current location"
      >
        <BiSolidNavigation className="text-black-primary" size={26} />
      </button>
      <CustomMarker position={userMarker} text="2" />
    </GoogleMap>
  ) : (
    <></>
  );
}
