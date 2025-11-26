# Image URL Replacement Flow

## Overview
This document outlines how images are uploaded to S3, stored in the database, and displayed in blog posts.

## Data Flow

### 1. **Upload Stage** (Frontend → Backend)
- User uploads images via `ImageUploader` component
- Backend uploads to S3 with key format: `posts/{timestamp}_{originalFilename}`
- Backend returns `ImageResponse` list containing:
  - `imgPath`: S3 key (e.g., `posts/1698765432000_Screenshot.png`)
  - `fileName`: Original filename (e.g., `Screenshot.png`)
  - Other metadata: `geoLat`, `geoLong`, `imgDtm`, etc.
- Frontend stores this in FormContext's `images` array

### 2. **Blog Post Editing** (Frontend)
- User embeds images using Insert button
- Description stored with filename tags: `<img>Screenshot.png</img>`
- Preview modal shows images using temporary preview URLs
- When publishing, frontend uses `replaceImageUrlsInContent()` to convert:
  - `<img>Screenshot.png</img>` → `<img-url>https://bucket.s3.amazonaws.com/posts/1698765432000_Screenshot.png</img-url>`

### 3. **Blog Post Storage** (Frontend → Backend)
Frontend sends to backend:
```json
{
  "title": "My Blog Post",
  "description": "<img-url>https://bucket.s3.amazonaws.com/posts/1698765432000_Screenshot.png</img-url>\n\nMy description text...",
  "thumbnailImageId": 123,
  "images": [
    {
      "imgId": 1,
      "imgPath": "posts/1698765432000_Screenshot.png",
      "fileName": "Screenshot.png",
      ...
    }
  ]
}
```

Backend stores the description blob as-is with `<img-url>` tags.

### 4. **Blog Post Display** (Backend → Frontend)
- Backend fetches blog post content from database
- Content has `<img-url>` tags with actual S3 URLs
- Frontend renders using updated `renderMarkdown()` function
- Regex pattern matches both formats:
  - `<img>filename</img>` - used during editing
  - `<img-url>URL</img-url>` - received from backend

## Key Utilities

### `replaceImageUrlsInContent()`
**Purpose**: Convert filename tags to S3 URL tags before publishing

**Usage**:
```typescript
import { replaceImageUrlsInContent } from "@/utils/replace-image-urls";

const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;
const contentWithUrls = replaceImageUrlsInContent(
  description,
  images,
  s3BaseUrl
);

// Send contentWithUrls to backend
```

**Example**:
- Input: `<img>Screenshot.png</img>`
- Output: `<img-url>https://bucket.s3.amazonaws.com/posts/1698765432000_Screenshot.png</img-url>`

### `convertUrlTagsToFilenames()`
**Purpose**: Convert S3 URL tags back to filename tags (for loading into editor)

**Usage**:
```typescript
import { convertUrlTagsToFilenames } from "@/utils/replace-image-urls";

const editableContent = convertUrlTagsToFilenames(fetchedContent, images);
// Now content can be edited with <img>filename</img> tags
```

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_S3_BASE_URL=https://your-bucket.s3.amazonaws.com
```

## Frontend Regex Pattern
The `renderMarkdown()` function now handles:
- `**bold**` - Bold text
- `*italic*` - Italic text
- `<u>underline</u>` - Underlined text
- `<img>filename</img>` - Image during editing (shows from /images/ path)
- `<img-url>S3_URL</img-url>` - Image from S3 (received from backend)

## Database Schema

### images table (updated)
```
- imgId (Long, PK)
- postId (Long, FK)
- imgPath (String) → "posts/1698765432000_filename.png"
- fileName (String) → "filename.png"
- filePath (String) → Optional, full URL if pre-generated
- geoLat (String)
- geoLong (String)
- thumbYn (Boolean)
- imgDtm (String)
- rgstDtm (String)
```

### posts table (unchanged)
```
- postId (Long, PK)
- description (BLOB) → Contains <img-url>URL</img-url> tags with markdown
- title (String)
- thumbnailImageId (Long, FK)
- ... other fields
```

## Summary

**Before publishing**: `<img>Screenshot.png</img>`
↓ (replaceImageUrlsInContent)
**Stored in DB**: `<img-url>https://bucket.s3.amazonaws.com/posts/1698765432000_Screenshot.png</img-url>`
↓ (renderMarkdown)
**Displayed to user**: Actual image from S3 URL

This approach keeps blog content simple while allowing flexible S3 URL management.
