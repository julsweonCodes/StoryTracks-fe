import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import MarkerTooltip from "./marker-tooltip";
import ClusterMarker from "./cluster-marker";
import { BiSolidNavigation } from "react-icons/bi";
import {
  ImageCluster,
  getClusterLevelFromZoom,
} from "@/hooks/queries/use-image-clusters";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 49.2827,
  lng: -123.1207,
};

interface PostThumbnail {
  postId: number;
  title: string;
  src: string;
}

interface MarkerWithData extends google.maps.LatLngLiteral {
  postId?: number;
  title?: string;
  src?: string;
  des?: string;
}

interface ClusterWithPosts extends google.maps.LatLngLiteral {
  count?: number;
  posts?: MarkerWithData[];
  thumbnails?: PostThumbnail[];
}

interface Props {
  markers?: MarkerWithData[];
  imageClusters?: ImageCluster[];
  zoom?: number;
  maxZoom?: number;
  minZoom?: number;
  center?: { lat: number; lng: number };
  onMarkerClick?: (lat: number, lng: number, posts: MarkerWithData[]) => void;
  onClusterClick?: (cluster: ImageCluster) => void;
  onZoomChange?: (zoom: number) => void;
  onClusterLevelChange?: (level: 1 | 2 | 3) => void;
  useBackendClusters?: boolean;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
}

export default function Map({
  markers = [],
  imageClusters = [],
  zoom = 15,
  maxZoom = 18,
  minZoom = 0,
  center: initialCenter,
  onMarkerClick,
  onClusterClick,
  onZoomChange,
  onClusterLevelChange,
  useBackendClusters = false,
  mapRef: externalMapRef,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [center, setCenter] = useState(initialCenter || defaultCenter);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Local clustering (frontend-based)
  const [clusters, setClusters] = useState<ClusterWithPosts[]>([]);

  // Calculate clusters from local markers (frontend method)
  const calculateClusters = useCallback(() => {
    if (
      !mapRef.current ||
      !isMapReady ||
      markers.length === 0 ||
      useBackendClusters
    ) {
      return;
    }

    const map = mapRef.current;
    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom() || 15;
    const gridSize = 0.002 / Math.pow(2, zoom - 15);
    const clusterMap: Record<
      string,
      { lat: number; lng: number; count: number; posts: MarkerWithData[] }
    > = {};

    markers.forEach((marker) => {
      const gridLat = Math.floor(marker.lat / gridSize);
      const gridLng = Math.floor(marker.lng / gridSize);
      const gridKey = `${gridLat}-${gridLng}`;

      if (!clusterMap[gridKey]) {
        clusterMap[gridKey] = { lat: 0, lng: 0, count: 0, posts: [] };
      }

      clusterMap[gridKey].lat += marker.lat;
      clusterMap[gridKey].lng += marker.lng;
      clusterMap[gridKey].count += 1;
      clusterMap[gridKey].posts.push(marker);
    });

    let clustersResult = Object.values(clusterMap).map((cluster) => {
      const thumbnails: PostThumbnail[] = cluster.posts
        .slice(0, 4)
        .map((post) => ({
          postId: post.postId || 0,
          title: post.title || "Untitled",
          src: post.src || "",
        }));

      return {
        lat: cluster.lat / cluster.count,
        lng: cluster.lng / cluster.count,
        count: cluster.count,
        posts: cluster.posts,
        thumbnails,
      };
    });

    // For main feed (non-backend), show only top 20 sparse clusters to avoid crowding
    if (clustersResult.length > 20) {
      // Sort by count descending and take top 20 most significant clusters
      clustersResult = clustersResult
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }

    setClusters(clustersResult);
  }, [markers, isMapReady, useBackendClusters]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const map = mapRef.current;

    if (!useBackendClusters) {
      // Frontend clustering mode
      calculateClusters();

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
    }
  }, [isMapReady, calculateClusters, useBackendClusters]);

  // Handle zoom changes for backend cluster refetching
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const handleZoomChange = () => {
      const newZoom = map.getZoom() || 15;
      setCurrentZoom(newZoom);
      onZoomChange?.(newZoom);

      // Notify about cluster level change
      const newLevel = getClusterLevelFromZoom(newZoom);
      onClusterLevelChange?.(newLevel);
    };

    const listener = map.addListener("zoom_changed", handleZoomChange);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [onZoomChange, onClusterLevelChange]);

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      mapRef.current = map;
      if (externalMapRef) {
        externalMapRef.current = map;
      }
      setIsMapReady(true);
    },
    [externalMapRef],
  );

  const onUnmount = useCallback(function callback() {
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

  useEffect(() => {
    if (initialCenter) {
      setCenter(initialCenter);
    }
  }, [initialCenter]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        maxZoom: maxZoom,
        minZoom: minZoom,
      }}
    >
      <button
        className="absolute right-5 top-5 flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-white-primary shadow-md shadow-gray-400"
        onClick={moveToCurrentLocation}
        aria-label="move to current location"
      >
        <BiSolidNavigation className="text-black-primary" size={26} />
      </button>

      {/* Individual post markers - only show when NOT using backend clusters */}
      {!useBackendClusters && markers.length > 0
        ? markers.map((marker, index) => {
            // Skip rendering if no src available
            if (!marker.src) return null;

            return (
              <MarkerTooltip
                key={`individual-marker-${marker.postId}-${index}`}
                position={marker}
                posts={[
                  {
                    postId: marker.postId || 0,
                    title: marker.title || "",
                    src: marker.src,
                  },
                ]}
                count={1}
                onMarkerClick={() =>
                  onMarkerClick?.(marker.lat, marker.lng, [marker])
                }
              />
            );
          })
        : null}

      {/* Backend Image Clusters (overlay on top of markers) - Only show level 3 */}
      {useBackendClusters && imageClusters.length > 0
        ? imageClusters
            .filter((cluster) => cluster.cluster_level === 3)
            .map((cluster, index) => (
              <ClusterMarker
                key={`backend-cluster-${cluster.cluster_lat}-${cluster.cluster_long}-${index}`}
                cluster={cluster}
                onClusterClick={onClusterClick}
              />
            ))
        : null}

      {/* Frontend Post Clusters (when not using backend clusters) */}
      {!useBackendClusters && clusters.length > 0
        ? clusters.map((marker, index) => (
            <MarkerTooltip
              key={`frontend-cluster-${marker.lat}-${marker.lng}-${index}`}
              position={marker}
              posts={marker.thumbnails || []}
              count={marker.count || 0}
              onMarkerClick={() =>
                onMarkerClick?.(marker.lat, marker.lng, marker.posts || [])
              }
            />
          ))
        : null}
    </GoogleMap>
  ) : (
    <></>
  );
}
