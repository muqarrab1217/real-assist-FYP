# 🎯 SUPABASE SETUP - SIMPLE VISUAL GUIDE

## What to Create

```
┌─────────────────────────────────────────┐
│  SUPABASE STORAGE BUCKET SETUP          │
├─────────────────────────────────────────┤
│                                         │
│  BUCKET: project-images                │
│  TYPE: PRIVATE                          │
│                                         │
│  ADD 3 POLICIES:                        │
│  ✅ Upload (authenticated)              │
│  ✅ Read (public)                       │
│  ✅ Delete (authenticated)              │
│                                         │
└─────────────────────────────────────────┘
```

---

## Permissions Matrix

```
┌────────────────────────────────────────────────┐
│              WHO CAN DO WHAT                   │
├────────────────────────────────────────────────┤
│                                                │
│  Upload Images:                                │
│  ┌────────────────────────────────────────┐   │
│  │ ✅ Logged-in users (admin, clients)   │   │
│  │ ❌ Nobody else                         │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  View/Display Images:                          │
│  ┌────────────────────────────────────────┐   │
│  │ ✅ Everyone (logged in or not)        │   │
│  │ ✅ Works for public web pages         │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  Delete Images:                                │
│  ┌────────────────────────────────────────┐   │
│  │ ✅ Logged-in users only               │   │
│  │ ❌ Public users cannot delete         │   │
│  └────────────────────────────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Three Policies You Need

### Policy 1️⃣
```
NAME:     Allow authenticated users to upload
ACTION:   INSERT (uploading)
ROLE:     authenticated (logged-in users)
ALLOWS:   Only logged-in users can upload files
```

### Policy 2️⃣
```
NAME:     Allow public read
ACTION:   SELECT (viewing/downloading)
ROLE:     public (everyone)
ALLOWS:   Anyone can view/display images
```

### Policy 3️⃣
```
NAME:     Allow authenticated users to delete
ACTION:   DELETE (deleting)
ROLE:     authenticated (logged-in users)
ALLOWS:   Only logged-in users can delete files
```

---

## Data Flow

```
User Uploads Image
        ↓
┌──────────────────────────────────┐
│  Check: User logged in?          │
│  Check: File < 5MB?              │
│  Check: File is image?           │
└──────────────────────────────────┘
        ↓
    ✅ All OK?
        ↓
┌──────────────────────────────────┐
│  Upload to Supabase bucket       │
│  "project-images/projects/..."   │
└──────────────────────────────────┘
        ↓
┌──────────────────────────────────┐
│  Generate public URL             │
│  "https://...supabase.co/..."    │
└──────────────────────────────────┘
        ↓
┌──────────────────────────────────┐
│  Return URL to app               │
│  Save in database                │
│  Display on website              │
└──────────────────────────────────┘
```

---

## Security Model

```
                    BUCKET: project-images (PRIVATE)
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            POLICY 1      POLICY 2      POLICY 3
         (UPLOAD)        (READ)       (DELETE)
            │             │             │
     ┌──────┴───┐    ┌────┴────┐  ┌────┴─────┐
     │           │    │         │  │          │
  LOGGED-IN   DENY  PUBLIC   PUBLIC LOGGED-IN DENY
  ✅ CAN         X  ✅ CAN    ✅ CAN  ✅ CAN    X
                            (Display)
```

---

## Bucket File Structure After Setup

```
project-images/                  ← Bucket name
└─ projects/                      ← Auto-created by app
   ├─ 1710960000000-abc123.jpg   ← Your uploaded images
   ├─ 1710960000500-def456.png
   ├─ 1710960001000-xyz789.webp
   └─ ... more images
```

---

## URL Format

```
https://YOUR-SUPABASE-ID.supabase.co/storage/v1/object/public/project-images/projects/FILENAME

Example:
https://abc123def456.supabase.co/storage/v1/object/public/project-images/projects/1710960000000-abc123.jpg
                                                      └─────────────────────────────────────────────────┘
                                                                  This is auto-generated
```

---

## 3-Step Setup Summary

### Step 1: Create Bucket
```
Go to: Supabase → Storage
Action: Create new bucket
Name: project-images
Privacy: PRIVATE
Time: 30 seconds
```

### Step 2: Add 3 Policies
```
Go to: Supabase → Storage → project-images → Policies
Action: Add 3 policies (copy-paste the SQL)
Time: 2-3 minutes
```

### Step 3: Verify & Test
```
Go to: Your App → Create Project → Upload Image
Action: Upload test image
Expected: ✅ Success message
Time: 1 minute
```

**Total: 5 minutes** ⏱️

---

## Copy-Paste SQL (If Using SQL Editor)

```sql
-- Run all three at once

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-images');

CREATE POLICY "Allow authenticated users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');
```

---

## Final Checklist Before Testing

```
☐ Bucket name: project-images (lowercase)
☐ Bucket privacy: PRIVATE
☐ Policy 1 (INSERT): ✅ Green checkmark
☐ Policy 2 (SELECT): ✅ Green checkmark
☐ Policy 3 (DELETE): ✅ Green checkmark
☐ No error messages
☐ All 3 policies showing as "Enabled"
```

---

## Support Files

- **SUPABASE_BUCKET_SETUP.md** ← Detailed step-by-step guide
- **SUPABASE_SETUP_CHECKLIST.md** ← Quick checklist
- **IMAGE_UPLOAD_GUIDE.md** ← Complete technical docs
- **IMAGE_UPLOAD_QUICK_REFERENCE.md** ← Developer quick ref

---

**Status:** Ready to setup! Follow SUPABASE_SETUP_CHECKLIST.md for step-by-step instructions.
