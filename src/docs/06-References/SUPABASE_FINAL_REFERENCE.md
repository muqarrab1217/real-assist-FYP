# SUPABASE SETUP - FINAL REFERENCE

## TL;DR (Too Long; Didn't Read)

**Create:**
- 1 bucket named: `project-images`
- 3 RLS policies for: upload, read, delete

**That's it.** Image upload works immediately after.

---

## 📋 The EXACT Setup

### Bucket Configuration
```
Bucket Name:    project-images
Bucket Privacy: PRIVATE
Storage Path:   project-images/projects/[filename]
```

### Three Required Policies

| # | Name | Action | Role | SQL Expression |
|---|------|--------|------|----------------|
| 1 | Allow authenticated users to upload | INSERT | authenticated | `bucket_id = 'project-images'` (WITH CHECK) |
| 2 | Allow public read | SELECT | public | `bucket_id = 'project-images'` (USING) |
| 3 | Allow authenticated users to delete | DELETE | authenticated | `bucket_id = 'project-images'` (USING) |

---

## 🔐 Access Control Summary

```
OPERATION          WHO CAN?          REASON
─────────────────────────────────────────────────────
Upload image       Logged-in users    Prevent spam
View image         Everyone          Display on site
Delete image       Logged-in users    Admin control
```

---

## 📍 Locations in Supabase Dashboard

### To Create Bucket
```
Supabase Dashboard
  └─ Storage (left sidebar)
      └─ Click "Create a new bucket"
```

### To Add Policies
```
Supabase Dashboard
  └─ Storage (left sidebar)
      └─ Click "project-images" bucket
          └─ Click "Policies" tab
              └─ Click "Add policy"
```

### To View Uploaded Images
```
Supabase Dashboard
  └─ Storage (left sidebar)
      └─ Click "project-images" bucket
          └─ Browse "projects" folder
              └─ See all uploaded images
```

---

## ✅ How to Know Setup is Complete

**You'll see:**
- 1 bucket named `project-images` in Storage
- 3 green ✅ checkmarks next to the policies
- "PRIVATE" label on the bucket
- No error messages

**You can:**
- Upload images from the app
- See images display on pages
- Delete images from the app

---

## 🧪 Quick Verification Test

1. **Open your RealAssist app**
2. **Login as admin**
3. **Go to:** Projects → Create Project
4. **Find:** "Project Images" section
5. **Action:** Drag and drop an image
6. **Expected:** Upload succeeds, image appears in grid
7. **Check Supabase:** Storage → project-images → projects folder shows your image

---

## 🚀 What Happens Next

After setup is complete:

```
Step 1: Admin creates project
        ↓
Step 2: Admin uploads images (via drag-drop)
        ↓
Step 3: Images stored in Supabase bucket
        ↓
Step 4: Public URLs generated automatically
        ↓
Step 5: URLs saved in database
        ↓
Step 6: Images display on project pages
        ↓
Step 7: Works on deployed applications
```

---

## 📚 Documentation Map

**Read in this order:**

1. **SUPABASE_VISUAL_GUIDE.md** (Start here) ← Short visual overview
2. **SUPABASE_SETUP_CHECKLIST.md** (Follow this) ← Step-by-step to-do
3. **SUPABASE_BUCKET_SETUP.md** (Reference this) ← Detailed explanations
4. **IMAGE_UPLOAD_GUIDE.md** (For full context) ← Complete technical docs

---

## 🎯 Your Task Checklist

```
SETUP PHASE:
☐ Create bucket "project-images"
☐ Set bucket to PRIVATE
☐ Add policy: Allow authenticated users to upload
☐ Add policy: Allow public read
☐ Add policy: Allow authenticated users to delete

VERIFICATION:
☐ See 3 green checkmarks for policies
☐ No error messages
☐ Can see bucket in Storage

TESTING:
☐ Login to app
☐ Create test project
☐ Upload test image
☐ See success message
☐ Test image displays
☐ Try deleting image

DONE:
☐ Feature is production-ready!
```

---

## ❌ Mistakes to AVOID

```
DON'T:                              DO:
─────────────────────────────────────────────
Name: ProjectImages                 Name: project-images
Name: project_images                Name: project-images
Name: projects                       Name: project-images

Privacy: PUBLIC                      Privacy: PRIVATE

Skip policies                        Add all 3 policies

Miss one policy                      Add: inserT, select, delete

Wrong role (all users)               Role: authenticated for upload

Forget to test                       Test immediately after setup
```

---

## 📞 Quick Troubleshooting

```
PROBLEM                    SOLUTION
───────────────────────────────────────────────
Upload fails               Check bucket exists + 3 policies active
Images won't show          Check "Allow public read" policy exists
Can't delete images        Check delete policy exists + you're logged in
Bucket disappeared         Check Storage tab - it's still there
Policies not saving        Refresh page and retry
Can't find Upload button   Make sure you're in Storage section
```

---

## 🔗 Implementation Details

**App Uses:**
- Bucket: `project-images`
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Storage location: `projects/` folder
- File naming: `[timestamp]-[random].jpg`

**Code References:**
- `src/lib/supabaseStorage.ts` - Uses bucket name
- `src/components/Images/ImageUpload.tsx` - Upload UI
- `src/hooks/useFileUpload.ts` - State management

---

## 🎓 Understanding the Security

```
WHY PRIVATE BUCKET + PUBLIC READ POLICY?

Traditional Way (❌ Not secure):
Bucket: PUBLIC
Anyone can list all files
Anyone can delete any file

Better Way (✅ What we use):
Bucket: PRIVATE
RLS Policy controls access
Only authenticated users can upload
Only authenticated users can delete
Everyone can read (for displaying)
```

---

## 💾 What Gets Stored Where

```
IMAGE FILE:           Supabase Storage (bucket)
IMAGE URL:            Database (properties.images array)
FILE METADATA:        Supabase Storage logs
ACCESS LOGS:          Supabase audit logs
```

---

## 📊 Expected Results After Setup

```
Console: No errors ✅
Images upload: Successfully ✅
Progress shows: During upload ✅
URLs generate: Automatically ✅
Images display: On pages ✅
Delete works: For logged-in users ✅
App works: In production ✅
```

---

## 🎯 Success Criteria

**Setup is complete when:**

✅ Bucket `project-images` exists
✅ Bucket set to PRIVATE
✅ 3 policies showing green ✅ checkmarks
✅ Can upload images from app
✅ Images display on pages
✅ No error messages in console
✅ Deletion works for logged-in users

---

## 📋 Final Checklist

```
PRE-SETUP:
☐ Have Supabase dashboard open
☐ Have RealAssist project selected
☐ Located Storage section

BUCKET CREATION:
☐ Click "Create a new bucket"
☐ Name: project-images
☐ Privacy: PRIVATE
☐ Create button clicked
☐ Wait for bucket to appear

POLICY 1 - UPLOAD:
☐ Click project-images bucket
☐ Click Policies tab
☐ Add policy for INSERT
☐ Role: authenticated
☐ Paste SQL expression
☐ Save policy
☐ See green checkmark

POLICY 2 - READ:
☐ Add policy for SELECT
☐ Role: public
☐ Paste SQL expression
☐ Save policy
☐ See green checkmark

POLICY 3 - DELETE:
☐ Add policy for DELETE
☐ Role: authenticated
☐ Paste SQL expression
☐ Save policy
☐ See green checkmark

VERIFICATION:
☐ All 3 policies show ✅
☐ No red error icons
☐ Bucket shows PRIVATE
☐ Can see "projects" folder in bucket

TESTING:
☐ Open app and login
☐ Go to Create Project
☐ Upload test image
☐ See "Upload successful"
☐ Image appears in preview grid
☐ Submit form
☐ Check Supabase → image in bucket

COMPLETE:
☐ Feature ready for use!
☐ All tests pass
☐ Ready for production
```

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy 🟢
**Support:** Reference docs above
**Status:** Ready when you follow the checklist!
