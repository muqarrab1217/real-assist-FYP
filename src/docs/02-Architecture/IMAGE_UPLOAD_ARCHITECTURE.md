# RealAssist - Image Upload System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     AddProjectModal.tsx                              │  │
│  │                     (Form Container)                                 │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │              ImageUpload Component                             │ │  │
│  │  │        (Drag-drop, Preview, Upload UI)                         │ │  │
│  │  │                                                                │ │  │
│  │  │  ├─ Drag & Drop Zone                                         │ │  │
│  │  │  ├─ File Browser Button                                      │ │  │
│  │  │  ├─ Preview Grid                                             │ │  │
│  │  │  ├─ Progress Bar                                             │ │  │
│  │  │  ├─ Error/Success Messages                                   │ │  │
│  │  │  └─ Upload/Remove Buttons                                    │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                      │  │
│  │  (URL Input Section - Fallback Option)                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STATE MANAGEMENT LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    useFileUpload Hook                                │  │
│  │              (Custom React Hook)                                     │  │
│  │                                                                      │  │
│  │  State Management:                                                  │  │
│  │  ├─ uploadState (isUploading, progress, fileName, error, success)  │  │
│  │  ├─ files (selected files with previews)                           │  │
│  │  └─ uploadedUrls (public URLs)                                     │  │
│  │                                                                      │  │
│  │  Methods:                                                            │  │
│  │  ├─ handleFileSelect()    ─── manages file selection               │  │
│  │  ├─ removeFile()          ─── removes selected file                │  │
│  │  ├─ uploadFiles()         ─── uploads multiple files               │  │
│  │  ├─ uploadSingleFile()    ─── uploads single file                  │  │
│  │  └─ reset()               ─── clears all state                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UTILITY & PROCESSING LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │  supabaseStorage.ts      │  │       imageUtils.ts                    │  │
│  │  (Core Logic)            │  │  (Image Processing)                    │  │
│  │                          │  │                                        │  │
│  │  Functions:              │  │  Functions:                            │  │
│  │  ├─ uploadImageFile()    │  │  ├─ getImageDimensions()             │  │
│  │  ├─ uploadMultipleImages │  │  ├─ validateImageDimensions()         │  │
│  │  ├─ deleteImageFile()    │  │  ├─ compressImage()                   │  │
│  │  ├─ getImagePublicUrl()  │  │  ├─ getImagePreview()                 │  │
│  │  ├─ validateFile()       │  │  ├─ formatFileSize()                  │  │
│  │  └─ generateFileName()   │  │  ├─ getFileExtension()                │  │
│  │                          │  │  ├─ isImage()                         │  │
│  │  Validation:             │  │  └─ getImageType()                    │  │
│  │  ├─ File type (JPEG...)  │  │                                        │  │
│  │  ├─ File size (5MB max)  │  │  Processing:                           │  │
│  │  └─ Unique filenames     │  │  ├─ Image compression                 │  │
│  │                          │  │  ├─ Dimension validation               │  │
│  │  Constants:              │  │  └─ Preview generation                │  │
│  │  ├─ BUCKET_NAME          │  │                                        │  │
│  │  ├─ MAX_FILE_SIZE        │  │  Utilities:                            │  │
│  │  └─ ALLOWED_TYPES        │  │  ├─ File formatting                   │  │
│  │                          │  │  └─ Type detection                     │  │
│  └──────────────────────────┘  └────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STORAGE SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         Supabase Storage                                    │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐    │
│    │           Bucket: "project-images"                               │    │
│    │                                                                  │    │
│    │  Folder Structure:                                              │    │
│    │  project-images/                                                │    │
│    │  └─ projects/                                                   │    │
│    │     ├─ 1710960000000-abc123.jpg                                │    │
│    │     ├─ 1710960000500-def456.png                                │    │
│    │     └─ ...                                                      │    │
│    │                                                                  │    │
│    │  Security (RLS Policies):                                       │    │
│    │  ├─ INSERT: authenticated users only                            │    │
│    │  ├─ SELECT: public read (no auth needed)                        │    │
│    │  ├─ DELETE: authenticated users only                            │    │
│    │  └─ Path isolation: projects/ folder only                       │    │
│    └─────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PUBLIC URL OUTPUT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Format:                                                                     │
│  https://[PROJECT-ID].supabase.co/storage/v1/object/public/               │
│           project-images/projects/[UNIQUE-FILENAME]                        │
│                                                                              │
│  Example:                                                                    │
│  https://abc123def456.supabase.co/storage/v1/object/public/               │
│           project-images/projects/1710960000000-abc123.jpg                │
│                                                                              │
│  Usage:                                                                      │
│  ├─ Stored in database (properties.images array)                           │
│  ├─ Displayed in project detail view                                       │
│  ├─ Cached by CDN for fast delivery                                        │
│  └─ Accessible from deployed applications                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Selects Files
    │
    ▼
┌─────────────────────────┐
│ File Input / Drag-Drop  │
│  (ImageUpload.tsx)      │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│ handleFileSelect()                          │
│ - Read file list                            │
│ - Generate previews (imageUtils)            │
│ - Add to state (files)                      │
└─────────────────────────────────────────────┘
    │
    ▼
User Reviews Previews & Clicks Upload
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ uploadFiles() Hook Method                                │
│ - Set isUploading = true                                 │
│ - Call uploadMultipleImages() for each file             │
└──────────────────────────────────────────────────────────┘
    │
    ▼
For Each File:
    │
    ├─ Validate (supabaseStorage.validateFile)
    │  ├─ Check file size < 5MB
    │  └─ Check type is JPEG/PNG/WebP/GIF
    │
    ├─ Generate unique name (timestamp + random)
    │
    ├─ Upload to Supabase (supabase.storage.upload)
    │  └─ POST to /storage/v1/object/project-images/...
    │
    └─ Get public URL (supabase.storage.getPublicUrl)
       └─ Yes: File -> Supabase Storage
          No:  Return error message
    │
    ▼
Collect Results:
    │
    ├─ Success URLs → uploadedUrls state
    └─ Errors → error state
    │
    ▼
Update Components:
    │
    ├─ Progress bar updates (progress state)
    ├─ Success message shows
    └─ Clear form data & reset hook
    │
    ▼
Pass URLs to Form:
    │
    └─ onImagesUpload(urls) callback
       └─ UpdateFormData.images array
    │
    ▼
User Submits Form:
    │
    └─ Images included in project creation
       └─ Saved to database (properties.images)
```

## Component Interaction Diagram

```
┌────────────────────────────────────────────────┐
│        AddProjectModal.tsx                     │
│     (Parent Component)                         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ ImageUpload Component                    │ │
│  │ - Uses useFileUpload hook                │ │
│  │ - Manages UI state                       │ │
│  │ - Displays upload interface              │ │
│  │                                          │ │
│  │ ┌────────────────────────────────────┐ │ │
│  │ │ useFileUpload Hook                 │ │ │
│  │ │ ├─ Manage file selections          │ │ │
│  │ │ ├─ Call uploadImageFile()          │ │ │
│  │ │ ├─ Track progress                  │ │ │
│  │ │ └─ Collect URLs                    │ │ │
│  │ │                                    │ │ │
│  │ │ Calls supabaseStorage functions:   │ │ │
│  │ │ ├─ uploadImageFile()               │ │ │
│  │ │ ├─ uploadMultipleImages()          │ │ │
│  │ │ ├─ validateFile()                  │ │ │
│  │ │ └─ generateFileName()              │ │ │
│  │ └────────────────────────────────────┘ │ │
│  │                                          │ │
│  │ Uses imageUtils for:                    │ │
│  │ ├─ getImagePreview()                    │ │
│  │ ├─ formatFileSize()                     │ │
│  │ └─ isImage()                            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  onImagesUpload callback:                     │
│  setFormData(prev => ({                       │
│    ...prev,                                   │
│    images: [...prev.images, ...urls]          │
│  }))                                          │
└────────────────────────────────────────────────┘
           │
           │ Form submission
           ▼
    ┌──────────────────┐
    │ API Service      │
    │ adminAPI.        │
    │ createProperty() │
    │                  │
    │ Sends:           │
    │ {                │
    │   name: "...",   │
    │   images: [      │
    │     "https://...",
    │     "https://..."
    │   ],             │
    │   ...            │
    │ }                │
    └──────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ Supabase Database                │
    │ Table: properties                │
    │ Field: images (JSONB array)      │
    │                                  │
    │ Stores URLs for later retrieval  │
    └──────────────────────────────────┘
```

## File Organization

```
src/
├── lib/
│   ├── supabaseStorage.ts     ← Upload/Download operations
│   ├── imageUtils.ts           ← Image processing utilities
│   └── supabase.ts             ← Existing Supabase config
│
├── hooks/
│   ├── useFileUpload.ts        ← State management hook (NEW)
│   └── ... existing hooks
│
├── components/
│   ├── Images/                 ← New folder
│   │   └── ImageUpload.tsx     ← Upload component (NEW)
│   │
│   ├── Projects/
│   │   └── AddProjectModal.tsx ← Updated with ImageUpload
│   │
│   └── ... other components
│
├── services/
│   └── api.ts                  ← API service (unchanged)
│
└── types/
    └── index.ts                ← TypeScript types

Project Root/
├── IMAGE_UPLOAD_GUIDE.md       ← Complete documentation
├── IMAGE_UPLOAD_QUICK_REFERENCE.md
├── PROJECT_REPORT_AND_TRACKER.md
└── CLAUDE.md
```

## Technology Stack

```
┌──────────────────────────────────────────┐
│         Frontend (React)                  │
│  - React 18+                             │
│  - TypeScript                            │
│  - Tailwind CSS (styling)                │
│  - Framer Motion (animations)            │
│  - Heroicons (icons)                     │
└──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│      RealAssist Image Upload System      │
│                                          │
│  Custom Modules:                        │
│  - supabaseStorage.ts (core logic)      │
│  - imageUtils.ts (processing)           │
│  - useFileUpload hook (state mgmt)      │
│  - ImageUpload component (UI)           │
└──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│    Supabase (Backend Service)            │
│  - Supabase Auth (logged-in users)      │
│  - Supabase Storage (file storage)      │
│  - PostgreSQL (metadata)                │
│  - RLS Policies (security)              │
└──────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   Deployment Infrastructure             │
│  - Frontend: Vercel (hosting)           │
│  - Backend: Express.js (existing)       │
│  - Database: Supabase (managed)         │
│  - Storage: Supabase Storage (CDN)      │
└──────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│              SECURITY LAYERS                        │
└─────────────────────────────────────────────────────┘

Layer 1: Client-Side Validation
├─ File type check (JPEG/PNG/WebP/GIF)
├─ File size limit (5MB)
└─ Prevents unnecessary requests

Layer 2: Supabase RLS Policies
├─ INSERT: authenticated users only
├─ SELECT: public read (for display)
├─ DELETE: authenticated users only
└─ Path isolation (projects/ folder)

Layer 3: Storage Service Layer
├─ Unique filenames (timestamp + random)
├─ Path isolation (no arbitrary paths)
└─ Consistent validation

Layer 4: Browser Security
├─ CORS configured
├─ Secure API keys in env
└─ HTTPS only in production

Layer 5: Database Security
├─ RLS on storage.objects table
├─ Auth context required
└─ Read access controlled
```

---

**Architecture Version**: 1.0
**Last Updated**: 2026-03-21
**Status**: Production Ready
