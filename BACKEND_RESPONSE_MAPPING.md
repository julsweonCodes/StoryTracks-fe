# Frontend Refactoring Summary - Backend Response Mapping

## Changes Made to Match Backend Response

### 1. **Updated `ImageInfo` Interface** (`form-context.tsx`)

Made all fields optional to support both:
- **Local image editing** (with `fileName`, `file`, `previewUrl`)
- **Backend response** (with `imgFileName`, `geoLat`/`geoLong` as strings)

```typescript
export interface ImageInfo {
  // Local editing fields
  id?: string;
  fileName?: string;      // Used during editing
  file?: File;
  previewUrl?: string;
  
  // Backend response fields
  imgId?: number;
  imgFileName?: string;   // From backend (replaces fileName)
  imgPath?: string;       // S3 key
  filePath?: string;      // S3 URL
  geoLat?: string;        // Backend uses string
  geoLong?: string;       // Backend uses string
  lat?: number;           // Optional conversion
  lon?: number;           // Optional conversion
  thumbYn?: boolean;
  ...
}
```

### 2. **Added Backend Response Types** (`form-context.tsx`)

```typescript
export interface ImageResponse {
  imgId: number;
  postId: number;
  geoLat: string;          // Note: string type
  geoLong: string;         // Note: string type
  imgPath: string;
  imgFileName: string;     // Not fileName
  imgDtm: string;
  rgstDtm: string;
  thumbYn: boolean;
  filePath: string;
}

export interface PostDetailResponse {
  postId: number;
  title: string;
  ogText: string;          // Blog description/content
  aiGenText: string;       // AI generated content
  rgstDtm: string;
  chngDtm: string;
  blogImgList: ImageResponse[];
}
```

### 3. **Created Image Mapper Utility** (`utils/image-mapper.ts`)

Converts backend responses to frontend format:

```typescript
convertImageResponseToImageInfo(imgResponse) 
// Maps: imgFileName → fileName, geoLat/geoLong → lat/lon

convertPostDetailResponseToFormData(postResponse)
// Maps: ogText → description, aiGenText → aiContent
```

### 4. **Updated URL Replacement Utilities** (`utils/replace-image-urls.ts`)

Now handles both `fileName` and `imgFileName`:

```typescript
const displayName = image.fileName || image.imgFileName;
```

### 5. **Fixed Type Safety Issues** (`write.tsx`)

- Added null checks for optional fields
- Used optional chaining: `images[0]?.lat`
- Added fallback for `previewUrl`: `image.previewUrl || "/placeholder.png"`
- Added fallback geo coordinates: `(images[0]?.lat || 0).toString()`

## Field Mapping Reference

| Backend (PostDetailResponse) | Frontend (FormContext) |
|-----|-----|
| `ogText` | `description` |
| `aiGenText` | `aiContent` (in aiContent array) |
| `blogImgList` | `images` |

| Backend (ImageResponse) | Frontend (ImageInfo) |
|-----|-----|
| `imgFileName` | `fileName` (for display) |
| `geoLat` (string) | `lat` (number, optional) |
| `geoLong` (string) | `lon` (number, optional) |
| `imgPath` | `imgPath` (same) |
| `filePath` | `filePath` (same) |
| `thumbYn` | `thumbYn` → `active` |

## Usage Example - Loading a Blog Post

```typescript
import { convertPostDetailResponseToFormData } from "@/utils/image-mapper";

// After fetching from backend
const postData = await fetch(`/api/v1/posts/${postId}`).then(r => r.json());

// Convert to frontend format
const { title, description, images, aiContent } = 
  convertPostDetailResponseToFormData(postData);

// Set in FormContext
setTitle(title);
updateDescription(description);
setImages(images);
```

## Key Points

1. **Backward Compatible**: Still works with local image uploads (without backend fields)
2. **Flexible Field Names**: Handles both `fileName` and `imgFileName`
3. **Type Safe**: All fields properly typed with optional chaining
4. **Null Safe**: Fallbacks for undefined values
5. **Conversion Utilities**: Easy mapping between frontend and backend formats

## Testing Checklist

- [ ] Image upload with local preview still works
- [ ] Fetched blog post images display correctly
- [ ] Geo coordinates convert from string to number properly
- [ ] Thumbnail selection (thumbYn) works as `active` flag
- [ ] Content with `<img>filename</img>` tags displays in preview
- [ ] Content with `<img-url>S3_URL</img-url>` tags displays correctly
- [ ] Image deletion with either fileName or imgFileName works
