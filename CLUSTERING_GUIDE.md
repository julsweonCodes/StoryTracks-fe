# Story Tracks - Marker Clustering Guide

## How Clustering Works

Our map uses **custom grid-based clustering** (NOT Google's built-in clustering). Posts are grouped into clusters based on their proximity at different zoom levels.

### Clustering Formula

```
gridSize = 0.002 / Math.pow(2, zoom - 15)
```

The grid size changes dynamically based on zoom level, creating larger clusters when zoomed out and smaller clusters when zoomed in.

---

## Zoom Level Analysis

### Zoom 5 (Continent View)

**Calculation:**
```
gridSize = 0.002 / Math.pow(2, 5 - 15)
         = 0.002 / Math.pow(2, -10)
         = 0.002 / (1/1024)
         = 0.002 × 1024
         = 2.048 degrees
```

**What happens:**
- Grid cells are **2.048° × 2.048°** in size
- At the equator: ~227 km × 227 km per grid cell
- **Result:** Many posts grouped into single clusters (e.g., "24", "18", "12")
- Ideal for: Seeing geographic distribution across continents

**Example:**
```
Posts in Tokyo, Bangkok, Mumbai → Could be 3 separate clusters
Posts along California coast → Could be 1 cluster showing "15 posts"
```

---

### Zoom 10 (Country View)

**Calculation:**
```
gridSize = 0.002 / Math.pow(2, 10 - 15)
         = 0.002 / Math.pow(2, -5)
         = 0.002 / (1/32)
         = 0.002 × 32
         = 0.064 degrees
```

**What happens:**
- Grid cells are **0.064° × 0.064°** in size
- At the equator: ~7 km × 7 km per grid cell
- **Result:** Posts grouped by city/region (e.g., "5", "8", "3")
- Ideal for: Seeing distribution within a country

**Example:**
```
Tokyo area posts → 1 cluster showing "8 posts"
Osaka area posts → 1 cluster showing "5 posts"
Rural areas → 1 cluster showing "2 posts"
```

---

### Zoom 15 (City/Street View)

**Calculation:**
```
gridSize = 0.002 / Math.pow(2, 15 - 15)
         = 0.002 / Math.pow(2, 0)
         = 0.002 / 1
         = 0.002 degrees
```

**What happens:**
- Grid cells are **0.002° × 0.002°** in size
- At the equator: ~222 meters × 222 meters per grid cell
- **Result:** Individual posts or very small groups (e.g., "1", "2", "3")
- Ideal for: Seeing individual post locations

**Example:**
```
Posts on the same street → Grouped as "2" or "3"
Posts in different neighborhoods → Separate clusters of "1"
```

---

## How Grid-Based Clustering Algorithm Works

### Step 1: Assign Posts to Grid Cells

For each post with coordinates (lat, lng):

```javascript
const gridLat = Math.floor(marker.lat / gridSize);
const gridLng = Math.floor(marker.lng / gridSize);
const gridKey = `${gridLat}-${gridLng}`;
```

**Example at Zoom 10 (gridSize = 0.064):**
- Post at (35.6762, 139.6503) → gridLat = 557, gridLng = 2180 → gridKey = "557-2180"
- Post at (35.6895, 139.6917) → gridLat = 560, gridLng = 2186 → gridKey = "560-2186"
- Posts at (34.0522, -118.2437) → gridLat = 531, gridLng = -1847 → gridKey = "531--1847"

### Step 2: Calculate Cluster Center

All posts in the same grid cell are averaged:

```javascript
cluster.lat = sum of all latitudes / count
cluster.lng = sum of all longitudes / count
cluster.count = total posts in cell
```

**Example:**
- Grid cell "557-2180" contains posts at: (35.6762, 139.6503), (35.6799, 139.6540), (35.6831, 139.6575)
- Cluster center = (35.6797, 139.6539)
- Display: "3" (showing 3 posts in this area)

### Step 3: Update on Map Events

Clustering recalculates whenever:
- Map is panned (`dragend`)
- User zooms in/out (`zoom_changed`)
- Map finishes loading (`idle`)

---

## Interactive Clustering Example

Imagine a blog with 50 posts across Japan:

| Zoom Level | View | Result |
|-----------|------|--------|
| 5 | Japan + neighbors (China, Korea) | Shows 1-2 clusters: "50 posts" or "48 posts in Japan, 2 in Korea" |
| 10 | Entire Japan | Shows ~5-8 clusters: Tokyo (15), Osaka (8), Kyoto (5), etc. |
| 15 | Tokyo metro area | Shows 10+ clusters or individual markers at neighborhood level |

---

## Clicking on Markers

When you click a marker:

1. **Cluster data is retrieved:** Get all posts in that grid cell
2. **Modal opens:** Display thumbnail cards of all posts in cluster
3. **Each thumbnail shows:** Title, preview image, description, post date
4. **Click post thumbnail:** Navigate to full post detail page

```
Click marker "8"
    ↓
Modal opens showing 8 thumbnail cards
    ↓
Click any thumbnail
    ↓
Navigate to /blog/{postId}
```

---

## Code Locations

- **Clustering logic:** `/src/components/map/index.tsx` → `calculateClusters()`
- **Custom marker UI:** `/src/components/map/custom-marker.tsx`
- **Click handler:** `/src/pages/user-blog-home/index.tsx` → `onMarkerClick`
- **Modal for cluster posts:** `/src/pages/user-blog-home/index.tsx` → Cluster Posts Modal section

---

## NOT Using Google's Built-in Clustering

Google Maps provides `MarkerClusterer` library, but we implemented custom clustering because:

1. **Control:** We manage exactly how many posts show per cluster
2. **Post data:** We can access post metadata (title, image, description) on click
3. **Consistent behavior:** Clustering works the same across all browsers
4. **Thumbnail display:** Easy to show post previews in modal

---

## Performance Notes

- Recalculation happens only on map events (not continuous)
- Clusters are recalculated only for **visible** posts (within map bounds)
- Grid size adapts automatically based on zoom level
- Efficient for up to 1000+ posts per user blog

---

## Future Enhancements

- [ ] Show post count range in cluster (e.g., "5-10 posts")
- [ ] Animate cluster expansion on click (show individual markers before modal)
- [ ] Heatmap view showing post density
- [ ] Time-based filters (posts from last week, month, etc.)
- [ ] Click marker to zoom in and recalculate smaller clusters
