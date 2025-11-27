# Interactive Map Markers - Implementation Guide

## Overview

This document outlines the interactive marker system with hover preview, click handlers, and backend spatial query best practices.

---

## 1. Frontend Implementation

### A. Marker Hover Preview (Tooltip)

**File:** `/src/components/map/marker-tooltip.tsx`

**Features:**
- Shows up to 4 thumbnail previews on hover
- Displays post count indicator
- Shows "+X more" if cluster has more than 4 posts
- Clickable marker with visual feedback

**Component Props:**
```tsx
interface Props {
  position: google.maps.LatLngLiteral;      // Cluster center lat/lng
  posts: PostThumbnail[];                   // Up to 4 posts for preview
  count: number;                            // Total posts in cluster
  onMarkerClick?: () => void;               // Callback when marker clicked
}
```

**Styling:**
- 4 thumbnails in 2x2 grid (16x16px each)
- Hover effect shows post title
- Border highlight on hover
- Purple badge with count number

### B. Map Component Updates

**File:** `/src/components/map/index.tsx`

**Key Changes:**
1. Clusters now include `thumbnails` array (up to 4 posts)
2. Click handler passes `(lat, lng, posts)` parameters
3. Uses `MarkerTooltip` instead of `CustomMarker`

**Clustering Algorithm:**
```
gridSize = 0.002 / 2^(zoom - 15)
```

**Cluster Object:**
```tsx
interface ClusterWithPosts {
  lat: number;              // Cluster center latitude
  lng: number;              // Cluster center longitude
  count?: number;           // Total posts in cluster
  posts?: MarkerWithData[]; // All posts in cluster
  thumbnails?: PostThumbnail[]; // First 4 posts for preview
}
```

### C. User Blog Home Page

**File:** `/src/pages/user-blog-home/index.tsx`

**Marker Click Flow:**
```
User clicks marker
  ↓
onMarkerClick(lat, lng, posts)
  ↓
Option 1: Use cached posts (if already loaded)
Option 2: Fetch from backend API using lat/lng bounds
  ↓
Update selectedClusterPosts state
  ↓
Show modal with thumbnails
```

**Handler Implementation:**
```tsx
onMarkerClick={async (lat, lng, posts) => {
  // Option 1: Local cached posts (current implementation)
  const matchedPosts = userPosts.filter(post =>
    posts.some((p: any) => p.postId === post.postId)
  );
  
  // Option 2: Fetch from backend (commented out)
  // const fetchedPosts = await fetchPostsByGeoLocation(
  //   { lat, lng, userId: userNumId },
  //   0.002
  // );
  
  setSelectedClusterPosts(matchedPosts);
  setShowClusterModal(true);
}}
```

---

## 2. Backend Design - Best Practices

### A. Database Schema

**Required Columns on `images` table:**
```sql
CREATE TABLE images (
  id BIGINT PRIMARY KEY,
  postId BIGINT NOT NULL,
  thumbImgPath VARCHAR(255),
  thumbGeoLat DECIMAL(10, 8),      -- Latitude: -90 to 90
  thumbGeoLong DECIMAL(11, 8),     -- Longitude: -180 to 180
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id)
);

-- Create spatial index for fast queries
CREATE INDEX idx_thumb_geo ON images (thumbGeoLat, thumbGeoLong);

-- Or use PostGIS spatial index (PostgreSQL)
CREATE INDEX idx_thumb_geo_spatial ON images USING GIST (
  ll_to_earth(thumbGeoLat, thumbGeoLong)
);
```

### B. Spatial Query Patterns

#### PostgreSQL with PostGIS

**Advantage:** Native geographic types, fast distance calculations

```sql
-- Query posts within a bounding box (grid cell)
SELECT 
  p.id as postId,
  p.title,
  i.thumbImgPath,
  i.thumbGeoLat,
  i.thumbGeoLong,
  earth_distance(
    ll_to_earth(i.thumbGeoLat, i.thumbGeoLong),
    ll_to_earth($1, $2)
  ) as distance_meters
FROM images i
JOIN posts p ON i.postId = p.id
WHERE 
  i.thumbGeoLat IS NOT NULL 
  AND i.thumbGeoLong IS NOT NULL
  AND p.user_id = $3
  AND earth_distance(
    ll_to_earth(i.thumbGeoLat, i.thumbGeoLong),
    ll_to_earth($1, $2)
  ) < $4  -- radius in meters
ORDER BY earth_distance(...) ASC
LIMIT 100;
```

#### MySQL Alternative

**Advantage:** Simpler, no extensions needed

```sql
-- Query posts within a bounding box
SELECT 
  p.id as postId,
  p.title,
  i.thumbImgPath,
  i.thumbGeoLat,
  i.thumbGeoLong,
  (
    6371 * ACOS(
      COS(RADIANS(90-i.thumbGeoLat)) * COS(RADIANS(90-$1))
      + SIN(RADIANS(90-i.thumbGeoLat)) * SIN(RADIANS(90-$1))
      * COS(RADIANS(i.thumbGeoLong-$2))
    )
  ) as distance_km
FROM images i
JOIN posts p ON i.postId = p.id
WHERE 
  i.thumbGeoLat BETWEEN $1 - 0.01 AND $1 + 0.01
  AND i.thumbGeoLong BETWEEN $2 - 0.01 AND $2 + 0.01
  AND p.user_id = $3
ORDER BY distance_km ASC
LIMIT 100;
```

### C. API Endpoint Design

#### Option 1: Location-Based Query

**Endpoint:** `GET /api/v1/user-blog/{userId}/posts/by-location`

**Query Parameters:**
```
latMin=-37.85
latMax=-37.80
lngMin=144.95
lngMax=145.00
```

**Response:**
```json
{
  "data": [
    {
      "postId": 123,
      "title": "Sydney Opera House",
      "thumbImgPath": "posts/123/thumb.jpg",
      "thumbGeoLat": "-33.8568",
      "thumbGeoLong": "151.2153"
    },
    ...
  ]
}
```

**Backend Implementation (Spring Boot):**
```java
@GetMapping("/user-blog/{userId}/posts/by-location")
public ResponseEntity<?> getPostsByLocation(
  @PathVariable Long userId,
  @RequestParam Double latMin,
  @RequestParam Double latMax,
  @RequestParam Double lngMin,
  @RequestParam Double lngMax
) {
  List<PostLocation> posts = postService.findPostsByGeoBox(
    userId, latMin, latMax, lngMin, lngMax
  );
  return ResponseEntity.ok(new ApiResponse<>(posts));
}

// Service layer
public List<PostLocation> findPostsByGeoBox(
  Long userId, 
  Double latMin, Double latMax,
  Double lngMin, Double lngMax
) {
  return imageRepository.findByUserAndLocationBox(
    userId, latMin, latMax, lngMin, lngMax
  );
}

// Repository (Spring Data JPA)
@Query("SELECT new PostLocation(p.id, p.title, i.thumbImgPath, i.thumbGeoLat, i.thumbGeoLong) " +
       "FROM Image i JOIN Post p ON i.postId = p.id " +
       "WHERE p.userId = :userId " +
       "  AND i.thumbGeoLat BETWEEN :latMin AND :latMax " +
       "  AND i.thumbGeoLong BETWEEN :lngMin AND :lngMax")
List<PostLocation> findByUserAndLocationBox(
  @Param("userId") Long userId,
  @Param("latMin") Double latMin,
  @Param("latMax") Double latMax,
  @Param("lngMin") Double lngMin,
  @Param("lngMax") Double lngMax
);
```

#### Option 2: Pre-Computed Clusters (Recommended for Scale)

**Endpoint:** `GET /api/v1/user-blog{userId}/posts/clusters`

**Query Parameters:**
```
zoomLevel=5
gridSize=2.048
```

**Response:** Pre-aggregated clusters with counts

```json
{
  "data": [
    {
      "lat": 35.6762,
      "lng": 139.6503,
      "count": 24,
      "sample": [
        {"postId": 1, "title": "Post 1", "thumbImgPath": "..."},
        {"postId": 2, "title": "Post 2", "thumbImgPath": "..."},
        {"postId": 3, "title": "Post 3", "thumbImgPath": "..."},
        {"postId": 4, "title": "Post 4", "thumbImgPath": "..."}
      ]
    },
    ...
  ]
}
```

**Backend Implementation:**
```java
@GetMapping("/user-blog/{userId}/posts/clusters")
public ResponseEntity<?> getClusteredPosts(
  @PathVariable Long userId,
  @RequestParam Integer zoomLevel,
  @RequestParam Double gridSize
) {
  List<ClusterDTO> clusters = clusterService.getPreComputedClusters(
    userId, zoomLevel
  );
  return ResponseEntity.ok(new ApiResponse<>(clusters));
}

// With Caching (Redis)
@Cacheable(value = "userClusters", key = "#userId + ':' + #zoomLevel")
public List<ClusterDTO> getPreComputedClusters(Long userId, Integer zoomLevel) {
  // Query database for pre-aggregated results
  return postRepository.findClusteredPostsByUser(userId, getGridSize(zoomLevel));
}

// Invalidate cache on new post
@CacheEvict(value = "userClusters", key = "#userId + '*'", allEntries = true)
public void invalidateUserClusters(Long userId) {}
```

### D. Caching Strategy

**Cache Key Pattern:** `user:{userId}:clusters:zoom:{zoomLevel}`

**TTL:** 3600 seconds (1 hour)

**Invalidation Triggers:**
- New post uploaded
- Post deleted
- Post image updated

**Redis Implementation:**
```java
@Service
public class MarkerClusterCache {
  
  @Autowired
  private RedisTemplate<String, ClusterDTO> redisTemplate;
  
  private static final long CACHE_TTL = 3600; // 1 hour
  
  public void cacheClusters(Long userId, Integer zoomLevel, List<ClusterDTO> clusters) {
    String key = buildKey(userId, zoomLevel);
    redisTemplate.opsForValue().set(
      key, 
      clusters, 
      Duration.ofSeconds(CACHE_TTL)
    );
  }
  
  public List<ClusterDTO> getClusters(Long userId, Integer zoomLevel) {
    String key = buildKey(userId, zoomLevel);
    return redisTemplate.opsForValue().get(key);
  }
  
  public void invalidateUserClusters(Long userId) {
    String pattern = "user:" + userId + ":clusters:*";
    Set<String> keys = redisTemplate.keys(pattern);
    if (!keys.isEmpty()) {
      redisTemplate.delete(keys);
    }
  }
  
  private String buildKey(Long userId, Integer zoomLevel) {
    return String.format("user:%d:clusters:zoom:%d", userId, zoomLevel);
  }
}
```

---

## 3. Cluster Aggregation Workflow

### Batch Processing Approach

**When:** Runs every hour or on-demand

**What:** Pre-compute marker clusters for all zoom levels

**Process:**
```
1. Query all posts with geo-coordinates for user
2. For each zoom level (5, 10, 15):
   - Group posts into grid cells
   - Calculate cluster center (average lat/lng)
   - Count posts per cell
   - Select 4 sample posts for preview
3. Store results in Redis cache
4. Return precomputed clusters
```

**Batch Job (Spring Boot):**
```java
@Service
public class ClusterBatchProcessor {
  
  @Scheduled(fixedDelay = 3600000) // Every 1 hour
  public void precomputeAllClusters() {
    List<Long> userIds = userRepository.findAllUserIds();
    
    for (Long userId : userIds) {
      for (Integer zoomLevel : Arrays.asList(5, 10, 15)) {
        precomputeCluster(userId, zoomLevel);
      }
    }
  }
  
  private void precomputeCluster(Long userId, Integer zoomLevel) {
    Double gridSize = calculateGridSize(zoomLevel);
    List<ClusterDTO> clusters = postRepository.aggregatePostsByGrid(userId, gridSize);
    clusterCache.cacheClusters(userId, zoomLevel, clusters);
  }
  
  private Double calculateGridSize(Integer zoomLevel) {
    return 0.002 / Math.pow(2, zoomLevel - 15);
  }
}
```

---

## 4. Frontend-Backend Integration

### Current Flow (Cached Posts)

```
1. Load user blog home
2. Fetch all user posts (already have lat/lng)
3. Frontend calculates clusters
4. Display markers with hover preview
5. Click marker → filter cached posts
6. Show modal with thumbnails
```

**Advantages:**
- No extra API calls
- Instant modal display
- Works offline after initial load

### Optimized Flow (Backend API)

```
1. Load user blog home
2. Fetch pre-computed clusters from backend
3. Display markers immediately with counts
4. Fetch all user posts (paginated if needed)
5. Click marker → API call for precise posts in area
6. Show modal with thumbnails
```

**Advantages:**
- Faster initial load (clusters pre-computed)
- Reduced frontend calculation
- Scalable to 1000+ posts
- Can show live counts

---

## 5. Performance Optimization

### Frontend

- ✅ Cluster calculation on map events (zoom, pan, drag)
- ✅ Memoize component to prevent unnecessary re-renders
- ✅ Limit thumbnail previews to 4 per marker
- ✅ Use image lazy-loading for thumbnails

### Backend

- ✅ Spatial index on geo columns
- ✅ Cache pre-computed clusters in Redis
- ✅ Pagination for large result sets
- ✅ Lazy-load detailed posts only on click

### Database

- ✅ INDEX on (thumbGeoLat, thumbGeoLong)
- ✅ Partition by user_id for large tables
- ✅ Archive old posts to separate table

---

## 6. File Structure

```
src/
├── components/
│   └── map/
│       ├── index.tsx              # Map component with clustering
│       ├── marker-tooltip.tsx     # NEW: Hover preview with 4 thumbnails
│       └── custom-marker.tsx      # Original marker (now unused)
├── pages/
│   └── user-blog-home/
│       └── index.tsx              # Handler for marker clicks
├── hooks/
│   └── utils/
│       └── geo-query.ts           # NEW: API utilities for geo queries
└── lib/
    └── auth.ts                    # Auth configuration
```

---

## 7. API Endpoints to Implement

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/user-blog/{userId}/posts/by-location` | GET | Fetch posts by lat/lng box | TODO |
| `/user-blog/{userId}/posts/clusters` | GET | Get pre-computed clusters | TODO |
| `/user-blog/{userId}/posts/{postId}/marker-count` | GET | Get count for specific area | TODO |

---

## 8. Next Steps

1. **Backend Development:**
   - Implement `/posts/by-location` endpoint
   - Add spatial indexes to database
   - Set up Redis caching

2. **Testing:**
   - Test hover tooltips with various post counts
   - Test click handlers with different zoom levels
   - Test backend API performance

3. **Optimization:**
   - Profile frontend clustering calculation
   - Monitor cache hit rates
   - Measure API response times

4. **Enhancements:**
   - Heatmap view showing post density
   - Time-based filtering (posts from last week)
   - Animate cluster expansion on click
