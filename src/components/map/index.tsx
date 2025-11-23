import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import CustomMarker from "./custom-marker";
import { BiSolidNavigation } from "react-icons/bi";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 49.2827,
  lng: -123.1207,
};

// const generateRandomMarkers = (
//   center: google.maps.LatLngLiteral,
//   count: number,
//   radius: number = 0.01,
// ): google.maps.LatLngLiteral[] => {
//   const markers: google.maps.LatLngLiteral[] = [];

//   for (let i = 0; i < count; i++) {
//     const randomLat = center.lat + (Math.random() - 0.5) * radius * 2;
//     const randomLng = center.lng + (Math.random() - 0.5) * radius * 2;
//     markers.push({ lat: randomLat, lng: randomLng });
//   }

//   return markers;
// };

interface Props {
  markers: google.maps.LatLngLiteral[];
  zoom?: number;
}

export default function Map({ markers = [], zoom = 15 }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [center, setCenter] = useState(defaultCenter); // 중심 좌표
  const markerClusterRef = useRef<MarkerClusterer | null>(null);

  const [clusters, setClusters] = useState<
    { lat: number; lng: number; count?: number }[]
  >([]);

  const calculateClusters = useCallback(() => {
    if (!mapRef.current || !isMapReady || markers.length === 0) {
      return;
    }

    const map = mapRef.current;
    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom() || 15;
    const gridSize = 0.002 / Math.pow(2, zoom - 15); // 줌 레벨에 따른 그리드 크기 조정
    const clusters: Record<
      string,
      { lat: number; lng: number; count: number }
    > = {};

    markers.forEach((marker) => {
      const gridLat = Math.floor(marker.lat / gridSize);
      const gridLng = Math.floor(marker.lng / gridSize);
      const gridKey = `${gridLat}-${gridLng}`;

      if (!clusters[gridKey]) {
        clusters[gridKey] = { lat: 0, lng: 0, count: 0 };
      }

      clusters[gridKey].lat += marker.lat;
      clusters[gridKey].lng += marker.lng;
      clusters[gridKey].count += 1;
    });

    const clustersResult = Object.values(clusters).map((cluster) => ({
      lat: cluster.lat / cluster.count,
      lng: cluster.lng / cluster.count,
      count: cluster.count,
    }));

    setClusters(clustersResult);
  }, [markers, isMapReady]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const map = mapRef.current;

    // 초기 계산
    calculateClusters();

    // 맵 이동, 줌 변경 등의 이벤트에 대한 리스너
    const listeners = [
      map.addListener("idle", calculateClusters),
      map.addListener("zoom_changed", calculateClusters),
      map.addListener("dragend", calculateClusters),
    ];

    return () => {
      listeners.forEach((listener) =>
        google.maps.event.removeListener(listener),
      );
    };
  }, [isMapReady, calculateClusters]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    setIsMapReady(true);
  }, []);

  const onUnmount = useCallback(function callback() {
    if (markerClusterRef.current) {
      markerClusterRef.current.setMap(null);
      markerClusterRef.current = null;
    }
    mapRef.current = null;
    setIsMapReady(false);
  }, []);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (mapRef.current) {
          mapRef.current.panTo(userLocation); // 지도 시각적 중심 이동
          mapRef.current.setZoom(15); // 줌 레벨 변경 (옵션)
        }

        setCenter(userLocation); // 상태 업데이트
      },
      (error) => {
        console.error("Error getting current location:", error);
      },
      {
        enableHighAccuracy: true, // 더 정확한 위치 정보 요청
        timeout: 5000, // 요청 제한 시간 설정
        maximumAge: 0, // 캐시된 위치 정보 사용하지 않음
      },
    );
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
        // setCenter(userLocation);
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
      }}
    >
      <button
        className="absolute right-5 top-5 flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-white-primary shadow-md shadow-gray-400"
        onClick={moveToCurrentLocation}
        aria-label="move to current location"
      >
        <BiSolidNavigation className="text-black-primary" size={26} />
      </button>
      {clusters.map((marker, index) => (
        <CustomMarker key={index} position={marker} text={`${marker.count}`} />
      ))}
    </GoogleMap>
  ) : (
    <></>
  );
}
