# Image Upload Feature - Implementation Guide

## Overview

This guide explains the image upload feature implementation for RealAssist. Users can now upload project images directly through the file upload dialog, and images are stored securely in Supabase Storage.

## Architecture

```
Frontend Component (ImageUpload.tsx)
    ↓
Hook (useFileUpload.ts) - State Management
    ↓
Supabase Storage Service (supabaseStorage.ts)
    ↓
Utilities (imageUtils.ts)
    ↓
Supabase Bucket (project-images)
    ↓
Public URL for Frontend Access
```

## Files Created

1. **`src/lib/supabaseStorage.ts`** - Core Supabase storage operations
   - File upload/download functions
   - File deletion
   - Public URL generation
   - File validation
   - Bucket initialization

2. **`src/lib/imageUtils.ts`** - Image processing utilities
   - Image dimension validation
   - Image compression
   - Preview generation
   - File size formatting
   - Image type detection

3. **`src/hooks/useFileUpload.ts`** - Custom React hook for upload management
   - Upload state management
   - Progress tracking
   - Multi-file handling
   - Error handling
   - File selection

4. **`src/components/Images/ImageUpload.tsx`** - Reusable upload component
   - Drag-and-drop interface
   - File preview
   - Upload progress
   - Error display
   - File management

5. **Updated `src/components/Projects/AddProjectModal.tsx`**
   - Integrated ImageUpload component
   - Kept URL input as fallback option

## Setup Instructions

### Step 1: Configure Supabase Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **Create a new bucket**
3. Set bucket name: `project-images`
4. **DO NOT make it public initially** (we'll use RLS policies)
5. Click **Create bucket**

### Step 2: Configure Bucket Policies (RLS)

1. In the bucket settings, go to **Policies**
2. Add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' AND
  (storage.foldername(name))[1] = 'projects'
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-images');
```

**Policy 3: Allow authenticated users to delete own uploads**
```sql
CREATE POLICY "Allow authenticated users to delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  auth.uid() = owner
);
```

### Step 3: Test the Feature

1. Navigate to **Admin Dashboard** → **Projects** → **Create Project**
2. Scroll to **Project Images** section
3. Either:
   - Drag and drop images into the upload area
   - Click "Browse Images" and select files
4. Images will upload individually
5. Use **Remove** button to delete images
6. Submit form to create project

## Features

### Upload Component Features

✅ **Drag and Drop** - Drag images directly into the upload area
✅ **File Browser** - Click button to browse and select files
✅ **Multiple Files** - Upload up to 10 files at once
✅ **Live Preview** - See preview of selected images before upload
✅ **Progress Tracking** - Real-time upload progress with percentage
✅ **Error Handling** - Clear error messages for failed uploads
✅ **File Validation** - Validates file size (5MB max) and type (JPEG, PNG, WebP, GIF)
✅ **Image Preview** - Shows uploaded images in a grid
✅ **Remove Option** - Remove images before or after upload
✅ **File Information** - Shows file name and size

### Validation Rules

- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Max File Size**: 5MB per image
- **Max Files**: 10 images per project
- **Recommended Dimensions**: 1600x1200px or higher

## Usage in Components

### Basic Usage

```typescript
import { ImageUpload } from '@/components/Images/ImageUpload';

<ImageUpload
  maxFiles={10}
  onImagesUpload={(urls) => {
    // Handle uploaded URLs
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...urls]
    }));
  }}
  existingImages={formData.images}
  onRemoveExisting={(index) => {
    // Handle image removal
  }}
  folder="projects"
/>
```

### Using the Hook Directly

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

const {
  uploadState,      // { isUploading, progress, fileName, error, success }
  files,           // Selected files with previews
  uploadedUrls,    // URLs of uploaded images
  handleFileSelect,
  removeFile,
  uploadFiles,
  uploadSingleFile,
  reset
} = useFileUpload({
  maxFiles: 10,
  folder: 'projects',
  onSuccess: (urls) => console.log('Uploaded:', urls),
  onError: (error) => console.error('Error:', error)
});
```

### Storage Service Functions

```typescript
import {
  uploadImageFile,      // Upload single file
  uploadMultipleImages, // Upload multiple files
  deleteImageFile,      // Delete single image
  deleteMultipleImages, // Delete multiple images
  getImagePublicUrl,    // Get public URL
  validateFile,         // Validate before upload
  initalizeBucket       // Initialize bucket (run once)
} from '@/lib/supabaseStorage';

// Upload single file
const result = await uploadImageFile(file, 'projects');
console.log(result.url); // Public URL

// Delete file
await deleteImageFile('projects/filename.jpg');
```

## Image URLs

### Format

```
https://[SUPABASE-URL]/storage/v1/object/public/project-images/projects/[FILENAME]
```

### Example

```
https://xxxxxx.supabase.co/storage/v1/object/public/project-images/projects/1710960000000-abc123.jpg
```

### Storage in Database

When images are uploaded, the URLs are stored in the `properties` table as a JSON array:

```json
{
  "images": [
    "https://xxxxxx.supabase.co/storage/v1/object/public/project-images/projects/1710960000000-abc123.jpg",
    "https://xxxxxx.supabase.co/storage/v1/object/public/project-images/projects/1710960000001-def456.jpg"
  ]
}
```

## Error Handling

The system handles various error scenarios:

1. **File Too Large** - Shows error: "File size exceeds 5MB limit"
2. **Invalid Type** - Shows error: "Only JPEG, PNG, WebP, and GIF images are allowed"
3. **Upload Failed** - Shows error with API message
4. **Network Error** - Shows error with retry suggestion
5. **Bucket Not Ready** - Gracefully logs warning, doesn't block flow

## Security Features

✅ **File Validation** - Validates file type and size on client
✅ **Type Checking** - Only allows image files
✅ **Size Limiting** - 5MB per file, 50MB total per project
✅ **RLS Policies** - Database-level security via Supabase RLS
✅ **Authenticated Upload** - Only authenticated users can upload
✅ **Unique Filenames** - Generated with timestamp + random string to prevent conflicts
✅ **Path Isolation** - All uploads go to `projects/` folder
✅ **Cache Control** - Cache for 1 hour, can be updated per request

## Performance Considerations

### Optimization Applied

✅ **Progressive Upload** - Upload shows real-time progress
✅ **Delayed Uploads** - 500ms delay between multiple files to avoid rate limiting
✅ **URL Reuse** - Same image can be used across multiple projects
✅ **Lazy Loading** - Images load on-demand in UI
✅ **CDN Caching** - Supabase uses CDN for fast image delivery

### Recommended Best Practices

1. **Compress images** before upload (especially for mobile)
2. **Use WebP format** for better compression
3. **Keep images under 2000x2000px** for web usage
4. **Use descriptive filenames** (for debugging)
5. **Clean up unused images** periodically

## Troubleshooting

### Images Not Uploading

1. Check browser console for error messages
2. Verify file size is under 5MB
3. Verify file type is JPEG, PNG, WebP, or GIF
4. Check Supabase bucket exists and is configured
5. Verify RLS policies are set correctly

### Images Not Displaying

1. Check image URL in browser console
2. Verify image exists in Supabase bucket
3. Check bucket is not private (must have public read policy)
4. Verify image format is correct
5. Check CORS settings in Supabase

### Slow Uploads

1. Check network speed (upload to Supabase server)
2. Try compressing images first
3. Upload fewer images at once
4. Check browser developer tools for bottlenecks
5. Verify Supabase region is close to user location

## Testing

### Manual Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Drag and drop images
- [ ] Remove image before upload
- [ ] Remove image after upload
- [ ] Upload too-large file (shows error)
- [ ] Upload invalid file type (shows error)
- [ ] Submit form with uploaded images
- [ ] Verify images appear in project detail view
- [ ] Verify images appear when deployed
- [ ] Test on mobile device
- [ ] Test on slow network
- [ ] Test form validation with file upload

### API Testing

```bash
# Get bucket info
curl https://[SUPABASE-URL]/rest/v1/storage/buckets/project-images \
  -H "apikey: [ANON-KEY]"

# List files in bucket
curl https://[SUPABASE-URL]/storage/v1/object/list/project-images/projects \
  -H "apikey: [ANON-KEY]"
```

## Database Changes Required

No database schema changes needed. The `images` field in the `properties` table already supports storing URLs as a JSON array.

## Environment Variables

No new environment variables needed. Uses existing Supabase credentials from:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deployment Checklist

Before deploying to production:

- [ ] Test uploads on staging environment
- [ ] Verify bucket is created in production Supabase
- [ ] Verify RLS policies are applied
- [ ] Test image accessibility from production domain
- [ ] Monitor initial uploads for errors
- [ ] Verify backup strategy for stored images
- [ ] Set up storage quota alerts

## Future Enhancements

Potential improvements for future versions:

1. **Image Compression** - Automatic compression before upload
2. **Multiple Sizes** - Generate thumbnails automatically
3. **Drag to Reorder** - Allow users to reorder images
4. **Batch Operations** - Delete multiple images at once
5. **Image Filters** - Filter by date, name, size
6. **CDN Integration** - Custom CDN for faster delivery
7. **Image Optimization** - AI-based image optimization
8. **Watermarking** - Add watermark to images
9. **EXIF Stripping** - Remove metadata from photos
10. **Backup System** - Automatic backup to another storage

## Support & Troubleshooting

For issues with image uploads:

1. Check browser console (F12) for error messages
2. Check Supabase dashboard for storage activity
3. Review RLS policies in Supabase
4. Check file permissions
5. Check network connectivity
6. Review server logs for API errors

## Related Documentation

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
- Image Optimization: https://web.dev/image-optimization/

---

**Version**: 1.0
**Last Updated**: 2026-03-21
**Status**: Production Ready
