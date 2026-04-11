# URGENT: Setup Required for Image Upload & Project Creation

## Problem Summary
Your app is failing because two things haven't been set up yet:

### 1. **Supabase Database Migration** ❌ NOT APPLIED
The properties table is missing 9 columns needed for unit configuration.

### 2. **Supabase Storage Bucket** ❌ NOT CREATED
The `project-images` bucket doesn't exist yet.

---

## Fix 1: Apply Database Migration (5 minutes)

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - Click: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Left sidebar → "SQL Editor"
   - Click "New Query"

3. **Copy & Paste Migration**
   ```sql
   -- Add unit range configuration columns to properties table
   ALTER TABLE public.properties
   ADD COLUMN room_number_min INTEGER,
   ADD COLUMN room_number_max INTEGER,
   ADD COLUMN floor_number_min INTEGER,
   ADD COLUMN floor_number_max INTEGER,
   ADD COLUMN unit_number_min TEXT,
   ADD COLUMN unit_number_max TEXT,
   ADD COLUMN area_min NUMERIC,
   ADD COLUMN area_max NUMERIC,
   ADD COLUMN unit_types JSONB DEFAULT '[]'::jsonb;

   -- Create index for performance
   CREATE INDEX idx_properties_unit_ranges ON public.properties(room_number_min, room_number_max, floor_number_min, floor_number_max);
   ```

4. **Run Query**
   - Click blue "Run" button
   - ✅ Should see "Success. No rows returned"

5. **Verify Columns**
   - Go to "Table Editor"
   - Click "properties" table
   - Scroll right to see new columns at the end
   - You should see: room_number_min, room_number_max, floor_number_min, floor_number_max, unit_number_min, unit_number_max, area_min, area_max, unit_types

---

## Fix 2: Create Storage Bucket (3 minutes)

Follow: **SUPABASE_SETUP_CHECKLIST.md** (in your project root)

OR quick version:

1. **Go to Supabase Dashboard**
2. **Storage** → **Create a new bucket**
3. **Name:** `project-images` (lowercase, exact)
4. **Privacy:** PRIVATE
5. **Create bucket**

### Then Add 3 RLS Policies:

**Policy 1 - Upload**
- Click "project-images" bucket
- Click "Policies" tab
- Click "Add policy" → "Insert"
- Role: authenticated
- WITH CHECK: `bucket_id = 'project-images'`
- Save

**Policy 2 - Read**
- Click "Add policy" → "Select"
- Role: public
- USING: `bucket_id = 'project-images'`
- Save

**Policy 3 - Delete**
- Click "Add policy" → "Delete"
- Role: authenticated
- USING: `bucket_id = 'project-images'`
- Save

---

## After You Complete Both:

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Try creating a new project** with images
3. **Images should now upload successfully** ✅

---

## Error Summary

### Current Errors:
- ❌ **"Failed to create project"** - Missing database columns
- ❌ **"No image" placeholders** - Bucket doesn't exist
- ❌ **400 error on properties query** - Supabase rejecting unknown columns

### After Setup:
- ✅ Project creation will work
- ✅ Images will upload to Supabase Storage
- ✅ Images will display in preview

---

## Timeline

```
BEFORE:
Project Creation Modal Opens
  ↓
User Uploads Images ← FAILS (bucket doesn't exist)
  ↓
User Submits Form
  ↓
API tries to create project ← FAILS (missing columns)

AFTER SETUP:
Project Creation Modal Opens
  ↓
User Uploads Images ✅ (uploaded to bucket)
  ↓
User Submits Form
  ↓
API creates project ✅ (columns exist)
  ↓
Project added to database ✅
```

---

## Files Referenced
- Migration file: `d:/FYP/FYP/migrations/004_add_unit_ranges_to_properties.sql`
- Setup guide: `SUPABASE_SETUP_CHECKLIST.md`
- Image upload code: `src/lib/supabaseStorage.ts`

---

## Having Issues?

1. **Migration won't run?**
   - Make sure you're in the right project
   - Try running `IF NOT EXISTS` versions

2. **Bucket creation fails?**
   - Check bucket name is exactly: `project-images` (lowercase)
   - No spaces, no underscores, no capitals

3. **Images still not showing?**
   - Clear browser cache (F12 → Application → Storage → Clear All)
   - Refresh page
   - Try uploading one test image

---

**Status:** 🔴 BLOCKED - Setup Required
**Estimated Time:** 8 minutes total
**Difficulty:** Easy
