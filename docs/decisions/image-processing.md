# Design Decision: Image Processing Pipeline

**Status**: Planned
**Last Updated**: 2026-02-12

## Problem Statement

Users upload photos of garments (taken as flatlays from above). These images need background removal and size optimization before storage.

## Decision

Client-side image processing using `@imgly/background-removal` and `browser-image-compression`, then upload the processed image to the backend which stores it in Supabase Storage.

## Pipeline

```
1. User takes/selects photo of garment (flatlay, top-down)
2. Frontend validates file size (max 10MB)
3. Frontend removes background (client-side, @imgly/background-removal)
4. Frontend compresses image (target: 500KB, max 1024px dimension, PNG for transparency)
5. Frontend uploads processed image to FastAPI endpoint
6. FastAPI stores image in Supabase Storage bucket
7. FastAPI returns public URL for the stored image
8. Frontend saves item with image URL to wardrobe
```

## Rationale

- **Client-side processing**: No server compute costs for background removal. User sees result before uploading.
- **Compress before upload**: Reduces upload time, bandwidth costs, and storage costs.
- **PNG format**: Preserves transparency from background removal. Essential for outfit builder compositing.
- **Supabase Storage**: S3-compatible, CDN-backed. Better than storing base64 in database.

## Configuration

```typescript
{
  maxSizeMB: 0.5,           // 500KB target
  maxWidthOrHeight: 1024,   // Max dimension
  fileType: 'image/png',    // Preserve transparency
  bgRemovalModel: 'medium'  // Balance quality/speed
}
```

## File Size Impact

- Original phone photo: ~3-5MB
- After processing: ~300-500KB
- Reduction: 90%+
- Storage capacity per 1GB: ~2,000 images (vs ~200 unoptimized)

## Alternatives Considered

1. **Server-side processing**: Rejected — higher compute costs, slower feedback loop for user
2. **Store base64 in database**: Rejected — bloats database, slower queries, no CDN
3. **No background removal**: Rejected — inconsistent images break outfit builder compositing
4. **WebP format**: Considered for future — 30% smaller than PNG, but less transparency support in older browsers

## Dependencies

- `@imgly/background-removal` - AI background removal (runs in browser via WebAssembly)
- `browser-image-compression` - Image resizing and compression
