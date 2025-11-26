/**
 * Utility for geographic post queries
 * Handles batch fetching of posts by geographic coordinates
 */

interface GeoQueryParams {
  lat: number;
  lng: number;
  userId: number;
}

interface PostLocation {
  postId: number;
  title: string;
  thumbImgPath: string;
  thumbGeoLat?: string;
  thumbGeoLong?: string;
}

/**
 * Fetches posts within a geographic cluster
 *
 * Backend should implement a range query:
 * - Find all posts where thumbGeoLat and thumbGeoLong are within a grid cell
 * - The grid size depends on zoom level (passed to backend)
 *
 * Best Practice: Spatial Index
 * - Use PostGIS or spatial indexes on thumbGeoLat + thumbGeoLong columns
 * - Create a GIST index: CREATE INDEX idx_thumb_geo ON images USING GIST (ll_to_earth(thumbGeoLat, thumbGeoLong))
 * - Query example: SELECT * FROM images WHERE earth_distance(ll_to_earth(thumbGeoLat, thumbGeoLong), ll_to_earth(?, ?)) < ?
 */
export const fetchPostsByGeoLocation = async (
  params: GeoQueryParams,
  gridSize: number = 0.002,
): Promise<PostLocation[]> => {
  try {
    // Calculate bounding box from grid center and size
    const latMin = params.lat - gridSize / 2;
    const latMax = params.lat + gridSize / 2;
    const lngMin = params.lng - gridSize / 2;
    const lngMax = params.lng + gridSize / 2;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${params.userId}/posts/by-location?` +
        new URLSearchParams({
          latMin: latMin.toString(),
          latMax: latMax.toString(),
          lngMin: lngMin.toString(),
          lngMax: lngMax.toString(),
        }).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch posts by location: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching posts by location:", error);
    return [];
  }
};

/**
 * Precomputes marker counts from post geographical data
 *
 * Best Practice: Batch Aggregation
 * 1. In backend, group posts by grid cells (same clustering algorithm as frontend)
 * 2. Cache results: Store pre-computed marker counts in Redis
 * 3. TTL: Refresh cache when new posts are added
 * 4. Return: Array of {lat, lng, count, samplePosts[]}
 *
 * Frontend benefits:
 * - Faster initial load (no clustering calculation needed)
 * - Shows accurate counts even before calculating clusters
 * - Can display marker counts immediately on page load
 */
export const precomputeMarkerCounts = async (
  userId: number,
  zoomLevel: number = 5,
): Promise<
  { lat: number; lng: number; count: number; sample: PostLocation[] }[]
> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/posts/marker-counts?zoomLevel=${zoomLevel}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch marker counts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching precomputed marker counts:", error);
    return [];
  }
};

/**
 * Creates a spatial query for clustering posts by geography
 *
 * Backend Implementation Strategy:
 *
 * 1. **Database Schema:**
 *    - images table columns: postId, thumbGeoLat (DECIMAL 10,8), thumbGeoLong (DECIMAL 11,8)
 *    - Create SPATIAL INDEX on (thumbGeoLat, thumbGeoLong)
 *
 * 2. **SQL Query Pattern (PostgreSQL with PostGIS):**
 *    ```sql
 *    SELECT
 *      FLOOR(thumbGeoLat / grid_size) as lat_grid,
 *      FLOOR(thumbGeoLong / grid_size) as lng_grid,
 *      COUNT(*) as count,
 *      AVG(thumbGeoLat) as cluster_lat,
 *      AVG(thumbGeoLong) as cluster_lng,
 *      JSON_AGG(JSON_BUILD_OBJECT(
 *        'postId', p.postId,
 *        'title', p.title,
 *        'thumbImgPath', i.thumbImgPath
 *      )) as sample_posts
 *    FROM images i
 *    JOIN posts p ON i.postId = p.postId
 *    WHERE
 *      thumbGeoLat IS NOT NULL
 *      AND thumbGeoLong IS NOT NULL
 *      AND p.userId = $1
 *    GROUP BY lat_grid, lng_grid
 *    HAVING COUNT(*) > 0
 *    LIMIT 1000
 *    ```
 *
 * 3. **MySQL Alternative:**
 *    ```sql
 *    SELECT
 *      FLOOR(thumbGeoLat / @grid_size) as lat_grid,
 *      FLOOR(thumbGeoLong / @grid_size) as lng_grid,
 *      COUNT(*) as count,
 *      AVG(thumbGeoLat) as cluster_lat,
 *      AVG(thumbGeoLong) as cluster_lng
 *    FROM images i
 *    JOIN posts p ON i.postId = p.postId
 *    WHERE
 *      thumbGeoLat IS NOT NULL
 *      AND thumbGeoLong IS NOT NULL
 *      AND p.userId = $1
 *    GROUP BY lat_grid, lng_grid
 *    ORDER BY count DESC
 *    LIMIT 1000
 *    ```
 *
 * 4. **Caching Strategy (Redis):**
 *    - Key: `user:{userId}:markers:zoom:{zoomLevel}`
 *    - TTL: 3600 seconds (1 hour) for zoom levels
 *    - Invalidate on POST /posts/save
 *
 * 5. **Performance Optimization:**
 *    - Use database-level aggregation (not application level)
 *    - Lazy-load detailed posts only when marker is clicked
 *    - Implement pagination for large clusters (100+ posts)
 */
export const buildGeoClusteringQuery = (
  userId: number,
  zoomLevel: number,
  gridSize: number,
) => {
  return {
    endpoint: `/users/${userId}/posts/clusters`,
    params: {
      zoomLevel,
      gridSize,
      limit: 1000,
    },
    description: "Fetch pre-aggregated post clusters by geographic location",
  };
};
