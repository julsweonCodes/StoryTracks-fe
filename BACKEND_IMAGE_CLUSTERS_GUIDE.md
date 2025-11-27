# Backend Image Clusters - Implementation Guide

## Overview

This document describes the integration of backend image clusters that are pre-aggregated at 3 zoom levels (city, province/state, country) and displayed dynamically on the map based on current zoom level.

---

## 1. Architecture

### Data Flow

```
Backend Database
  ↓
  [Images grouped by geographic level]
  ↓
API Endpoint: /api/v1/user-blog/{userId}/image-clusters?level={1|2|3}
  ↓
Frontend Hook: useImageClusters
  ↓
Zoom Detection
  ↓
Map Component renders ClusterMarker
```

### Three-Level Clustering

| Level | Type | Grid Size | Zoom Range | Example |
|-------|------|-----------|-----------|---------|
| 1 | City | ~0.5km | ≥ 12 | Seoul neighborhoods, Vancouver districts |
| 2 | Province/State | ~50km | 8-11 | Seoul metropolitan area, British Columbia |
| 3 | Country | ~1000km | ≤ 7 | South Korea, Canada |

---

## 2. Frontend Components

### A. `useImageClusters` Hook

**File:** `/src/hooks/queries/use-image-clusters.ts`

**Purpose:** Fetch pre-aggregated clusters from backend API

**Key Features:**
- Auto-selects cluster level based on zoom
- Returns cluster data with images count and thumbnail
- Handles loading/error states

**Zoom-to-Level Mapping:**
```typescript
getClusterLevelFromZoom(zoom: number): 1 | 2 | 3 {
  if (zoom >= 12) return 1;      // City level
  if (zoom >= 8) return 2;       // Province/state level
  return 3;                       // Country level
}
```

**Interface:**
```typescript
interface ImageCluster {
  cluster_level: 1 | 2 | 3;           // Aggregation level
  cluster_lat: number;                 // Center latitude
  cluster_long: number;                // Center longitude
  image_count: number;                 // Total images in cluster
  thumb_img_path: string;              // Representative thumbnail path
}
```

**Usage:**
```typescript
const { clusters, loading, fetchClusters } = useImageClusters({
  userId: 123,
  enabled: true
});

// Fetch clusters for specific zoom level
fetchClusters(10); // Gets level 2 clusters
```

### B. `ClusterMarker` Component

**File:** `/src/components/map/cluster-marker.tsx`

**Purpose:** Display individual cluster marker with dynamic sizing

**Features:**
- **Dynamic Size:** Based on `image_count` using logarithmic scaling
  ```
  markerSize = Math.min(30 + Math.log(count + 1) * 10, 80)
  Range: 30px (1 image) to 80px (100+ images)
  ```
- **Hover Tooltip:** Shows thumbnail preview and cluster info
- **Pulsing Animation:** Visual feedback indicating interactivity
- **Gradient Background:** Purple gradient for visual appeal

**Props:**
```typescript
interface Props {
  cluster: ImageCluster;
  onClusterClick?: (cluster: ImageCluster) => void;
}
```

**Visual Hierarchy:**
```
Small cluster (5 images)  → 30-40px marker
Medium cluster (20 images) → 45-55px marker
Large cluster (100 images) → 75-80px marker
```

### C. Updated Map Component

**File:** `/src/components/map/index.tsx`

**New Props:**
```typescript
interface Props {
  markers?: MarkerWithData[];              // Frontend posts
  imageClusters?: ImageCluster[];          // Backend clusters
  useBackendClusters?: boolean;             // Toggle mode
  onZoomChange?: (zoom: number) => void;  // Zoom listener
  onClusterClick?: (cluster: ImageCluster) => void;
}
```

**Rendering Logic:**
```typescript
// Backend clusters (recommended)
if (useBackendClusters && imageClusters.length > 0) {
  // Render ClusterMarker components
}

// Frontend calculation (fallback)
if (!useBackendClusters && clusters.length > 0) {
  // Render MarkerTooltip components
}
```

---

## 3. Backend API Contract

### Endpoint

```
GET /api/v1/user-blog/{userId}/image-clusters?level={1|2|3}
```

### Request Parameters

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| userId | Path | Yes | number | User's numeric ID |
| level | Query | Yes | 1, 2, 3 | Cluster aggregation level |

### Response Format

```json
{
  "data": [
    {
      "cluster_level": 1,
      "cluster_lat": 37.5665,
      "cluster_long": 126.9780,
      "image_count": 24,
      "thumb_img_path": "profiles/seoul_1.jpg"
    },
    {
      "cluster_level": 1,
      "cluster_lat": 37.4979,
      "cluster_long": 127.0276,
      "image_count": 8,
      "thumb_img_path": "profiles/bundang_1.jpg"
    }
  ],
  "success": true
}
```

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Clusters retrieved successfully |
| 400 | Invalid level parameter (must be 1, 2, or 3) |
| 404 | User not found |
| 500 | Server error |

---

## 4. Backend Implementation

### Database Schema

```sql
-- Images table with geo coordinates
CREATE TABLE images (
  id BIGINT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  thumb_img_path VARCHAR(255),
  thumb_geo_lat DECIMAL(10,8),      -- Latitude
  thumb_geo_long DECIMAL(11,8),     -- Longitude
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Indexes for fast clustering
CREATE INDEX idx_geo_lat_long ON images (thumb_geo_lat, thumb_geo_long);
CREATE INDEX idx_post_id ON images (post_id);
```

### SQL Query - Level 1 (City Clusters)

```sql
-- Cluster by 0.01 degree (~1km city blocks)
SELECT 
  1 as cluster_level,
  FLOOR(thumb_geo_lat * 100) / 100 as cluster_lat_group,
  FLOOR(thumb_geo_long * 100) / 100 as cluster_long_group,
  AVG(thumb_geo_lat) as cluster_lat,
  AVG(thumb_geo_long) as cluster_long,
  COUNT(*) as image_count,
  -- Get a representative thumbnail (e.g., most recent)
  (ARRAY_AGG(thumb_img_path ORDER BY i.created_at DESC))[1] as thumb_img_path
FROM images i
JOIN posts p ON i.post_id = p.id
WHERE p.user_id = $1
  AND thumb_geo_lat IS NOT NULL
  AND thumb_geo_long IS NOT NULL
GROUP BY 
  FLOOR(thumb_geo_lat * 100),
  FLOOR(thumb_geo_long * 100)
ORDER BY image_count DESC
LIMIT 1000;
```

### SQL Query - Level 2 (Province/State Clusters)

```sql
-- Cluster by 0.5 degree (~50km regions)
SELECT 
  2 as cluster_level,
  FLOOR(thumb_geo_lat * 2) / 2 as cluster_lat_group,
  FLOOR(thumb_geo_long * 2) / 2 as cluster_long_group,
  AVG(thumb_geo_lat) as cluster_lat,
  AVG(thumb_geo_long) as cluster_long,
  COUNT(*) as image_count,
  (ARRAY_AGG(thumb_img_path ORDER BY i.created_at DESC))[1] as thumb_img_path
FROM images i
JOIN posts p ON i.post_id = p.id
WHERE p.user_id = $1
  AND thumb_geo_lat IS NOT NULL
  AND thumb_geo_long IS NOT NULL
GROUP BY 
  FLOOR(thumb_geo_lat * 2),
  FLOOR(thumb_geo_long * 2)
ORDER BY image_count DESC
LIMIT 1000;
```

### SQL Query - Level 3 (Country Clusters)

```sql
-- Cluster by 5 degree (~500km countries)
SELECT 
  3 as cluster_level,
  FLOOR(thumb_geo_lat / 5) * 5 as cluster_lat_group,
  FLOOR(thumb_geo_long / 5) * 5 as cluster_long_group,
  AVG(thumb_geo_lat) as cluster_lat,
  AVG(thumb_geo_long) as cluster_long,
  COUNT(*) as image_count,
  (ARRAY_AGG(thumb_img_path ORDER BY i.created_at DESC))[1] as thumb_img_path
FROM images i
JOIN posts p ON i.post_id = p.id
WHERE p.user_id = $1
  AND thumb_geo_lat IS NOT NULL
  AND thumb_geo_long IS NOT NULL
GROUP BY 
  FLOOR(thumb_geo_lat / 5),
  FLOOR(thumb_geo_long / 5)
ORDER BY image_count DESC
LIMIT 1000;
```

### Spring Boot Implementation

```java
@RestController
@RequestMapping("/api/v1/user-blog/{userId}/image-clusters")
public class ImageClusterController {
  
  @Autowired
  private ImageClusterService clusterService;
  
  @GetMapping
  public ResponseEntity<?> getImageClusters(
    @PathVariable Long userId,
    @RequestParam(required = true) Integer level
  ) {
    // Validate level
    if (!Arrays.asList(1, 2, 3).contains(level)) {
      return ResponseEntity
        .badRequest()
        .body(new ApiResponse<>(false, "Level must be 1, 2, or 3", null));
    }
    
    List<ImageClusterDTO> clusters = clusterService.getClustersByLevel(userId, level);
    return ResponseEntity.ok(new ApiResponse<>(true, "OK", clusters));
  }
}

@Service
public class ImageClusterService {
  
  @Autowired
  private ImageClusterRepository repository;
  
  // With caching for 1 hour
  @Cacheable(value = "imageClusters", key = "#userId + ':' + #level", 
             unless = "#result.isEmpty()")
  public List<ImageClusterDTO> getClustersByLevel(Long userId, Integer level) {
    return repository.findClustersByUserAndLevel(userId, level);
  }
}

@Repository
public interface ImageClusterRepository extends JpaRepository<Image, Long> {
  
  @Query(value = "SELECT ... WHERE p.user_id = :userId AND cluster_level = :level", 
         nativeQuery = true)
  List<ImageClusterDTO> findClustersByUserAndLevel(
    @Param("userId") Long userId,
    @Param("level") Integer level
  );
}
```

### Caching Strategy

**Redis Configuration:**
```java
@Bean
public CacheManager cacheManager(RedisConnectionFactory factory) {
  RedisCacheConfiguration config = RedisCacheConfiguration
    .defaultCacheConfig()
    .entryTtl(Duration.ofHours(1))  // 1 hour TTL
    .serializeKeysWith(RedisSerializationContext
      .SerializationPair
      .fromSerializer(new StringRedisSerializer()))
    .serializeValuesWith(RedisSerializationContext
      .SerializationPair
      .fromSerializer(new GenericJackson2JsonRedisSerializer()));
  
  return RedisCacheManager.create(factory);
}
```

**Cache Invalidation:**
```java
@Service
public class PostService {
  
  @Autowired
  private CacheManager cacheManager;
  
  public void savePost(Post post) {
    // Save post logic...
    invalidateClusterCache(post.getUserId());
  }
  
  private void invalidateClusterCache(Long userId) {
    Cache cache = cacheManager.getCache("imageClusters");
    for (Integer level : Arrays.asList(1, 2, 3)) {
      cache.evict(userId + ":" + level);
    }
  }
}
```

---

## 5. Integration Flow

### On Page Load

```
1. Page loads
2. Get userNumId from session
3. Initialize map with zoom = 5
4. useImageClusters hook fetches level 3 clusters (country level)
5. Display country-level markers
```

### On Zoom In

```
Zoom 7 → 8
  ↓
onZoomChange triggered
  ↓
setCurrentZoom(8)
  ↓
useEffect re-runs
  ↓
fetchClusters(8) called
  ↓
Backend returns level 2 clusters (province)
  ↓
Map re-renders with province-level markers
```

### On Zoom Out

```
Zoom 12 → 11 → 10 → 8
  ↓
Each zoom triggers onZoomChange
  ↓
At zoom 8, cluster level changes from 1 to 2
  ↓
API fetches level 2 clusters
  ↓
Markers smoothly transition from city to province level
```

---

## 6. Visual Marker Sizing

### Logarithmic Scale Formula

```
markerSize = Math.min(baseSize + Math.log(imageCount + 1) * scaleFactor, maxSize)
           = Math.min(30 + Math.log(imageCount + 1) * 10, 80)
```

### Examples

| Image Count | Log Value | Marker Size | Visual |
|------------|-----------|-------------|--------|
| 1 | 0.69 | 37px | ● |
| 5 | 1.79 | 48px | ●● |
| 10 | 2.40 | 54px | ●●● |
| 20 | 3.04 | 60px | ●●●● |
| 50 | 3.93 | 69px | ●●●●● |
| 100+ | 4.61+ | 80px | ●●●●●● |

### Why Logarithmic?

- **Linear scaling:** 100-image cluster would be 30x larger (not practical)
- **Logarithmic scaling:** Balanced visual hierarchy (2-3x larger)
- **Human perception:** Log scale matches how we perceive size differences

---

## 7. Configuration

### Environment Variables

```
NEXT_PUBLIC_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_S3_BASE_URL=https://storytracks-ap-storage.s3.ap-southeast-2.amazonaws.com/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Component Props

**In user-blog-home:**
```tsx
<Map 
  imageClusters={imageClusters}
  zoom={currentZoom}
  useBackendClusters={true}
  onZoomChange={(zoom) => setCurrentZoom(zoom)}
  onClusterClick={(cluster) => {
    // Handle cluster click
  }}
/>
```

---

## 8. File Structure

```
src/
├── components/
│   └── map/
│       ├── index.tsx                # Main map component
│       ├── cluster-marker.tsx       # NEW: Backend cluster display
│       ├── marker-tooltip.tsx       # Frontend cluster preview
│       └── custom-marker.tsx        # Legacy (unused)
├── pages/
│   └── user-blog-home/
│       └── index.tsx                # Integration point
├── hooks/
│   └── queries/
│       ├── use-image-clusters.ts   # NEW: Cluster fetching
│       └── use-posts-list-query.ts # Existing posts
└── types/
    └── (image cluster interfaces)
```

---

## 9. Testing Checklist

- [ ] Zoom in from 5 to 15: Verify level changes from 3→2→1
- [ ] Zoom out from 15 to 5: Verify level changes from 1→2→3
- [ ] Click marker: Modal shows cluster details
- [ ] Marker sizes: Verify scaling based on image_count
- [ ] Thumbnails load: Verify S3 URLs render correctly
- [ ] Error handling: Test with invalid user ID
- [ ] Loading states: Verify spinners appear during fetch
- [ ] Cache hit: Load page twice, verify second load is faster

---

## 10. Performance Metrics

### Expected Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Initial cluster fetch | < 500ms | - |
| Zoom level change | < 300ms | - |
| Marker render | < 100ms | - |
| API cache hit rate | > 80% | - |

### Optimization Tips

- Zoom threshold: Only refetch if cluster level changes
- Cache TTL: 1 hour for balance between freshness and performance
- Batch queries: Group requests if multiple users zoom simultaneously
- CDN: Use CloudFront for S3 thumbnail images

---

## 11. Future Enhancements

- [ ] Animate marker transitions between zoom levels
- [ ] Show heatmap density instead of markers
- [ ] Time-based filtering (posts from last month)
- [ ] Download cluster summary as CSV
- [ ] WebSocket updates for real-time cluster changes
- [ ] A/B test linear vs logarithmic sizing
