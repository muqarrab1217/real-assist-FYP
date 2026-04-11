# Supabase Setup - Quick Checklist

## 🎯 What You Need to Create

### 1️⃣ ONE BUCKET
```
Name:      project-images
Privacy:   PRIVATE ✅
```

### 2️⃣ THREE RLS POLICIES
```
Policy 1: Allow authenticated users to upload
Policy 2: Allow public read (for displaying images)
Policy 3: Allow authenticated users to delete
```

---

## ✅ Step-by-Step Checklist

### Create Bucket
```
☐ Open Supabase Dashboard
☐ Go to Storage menu
☐ Click "Create a new bucket"
☐ Type name: "project-images"
☐ Select privacy: PRIVATE
☐ Click "Create bucket"
```

### Add Policy 1 (Upload)
```
☐ Click on "project-images" bucket
☐ Click "Policies" tab
☐ Click "Add policy"
☐ Action: INSERT
☐ Role: authenticated
☐ Copy-paste this in WITH CHECK box:
   bucket_id = 'project-images'
☐ Click "Review" then "Save policy"
```

### Add Policy 2 (Read)
```
☐ Click "Add policy" again
☐ Action: SELECT
☐ Role: public
☐ Copy-paste this in USING box:
   bucket_id = 'project-images'
☐ Click "Review" then "Save policy"
```

### Add Policy 3 (Delete)
```
☐ Click "Add policy" again
☐ Action: DELETE
☐ Role: authenticated
☐ Copy-paste this in USING box:
   bucket_id = 'project-images'
☐ Click "Review" then "Save policy"
```

### Verify Setup
```
☐ See 3 green checkmarks for policies
☐ Bucket shows as PRIVATE
☐ No error messages
```

---

## 📋 Copy-Paste Ready Policies

### Policy 1: Upload (Authenticated Users)
```sql
bucket_id = 'project-images'
```
- **Action:** INSERT
- **Role:** authenticated
- **Field:** WITH CHECK

---

### Policy 2: Read (Public Users)
```sql
bucket_id = 'project-images'
```
- **Action:** SELECT
- **Role:** public
- **Field:** USING

---

### Policy 3: Delete (Authenticated Users)
```sql
bucket_id = 'project-images'
```
- **Action:** DELETE
- **Role:** authenticated
- **Field:** USING

---

## 🧪 Test It

After setup, test the feature:

```
1. Open your app
2. Go to Admin Dashboard
3. Create a new project
4. Scroll to "Project Images" section
5. Drag and drop an image
6. Click "Upload"
7. See success message
8. Image appears in grid
```

---

## ❓ Quick Reference

| Question | Answer |
|----------|--------|
| **Bucket name?** | `project-images` (exact, lowercase) |
| **Bucket privacy?** | PRIVATE |
| **How many policies?** | 3 (upload, read, delete) |
| **Who can upload?** | Logged-in users only |
| **Who can view?** | Everyone (public) |
| **Who can delete?** | Logged-in users only |

---

## 🚨 Common Mistakes to Avoid

❌ **Wrong bucket name** (use: `project-images`)
- ❌ ProjectImages
- ❌ project_images
- ❌ projects
- ✅ project-images

❌ **Forgot to add policies** (need all 3)
- Must have INSERT policy
- Must have SELECT policy
- Must have DELETE policy

❌ **Public bucket instead of private** (use: PRIVATE)
- Policies provide the security, not bucket setting

❌ **Wrong policy actions**
- Upload = INSERT
- View = SELECT
- Delete = DELETE

---

## 💡 Pro Tips

1. **Name is case-sensitive** - must be lowercase: `project-images`
2. **After creating bucket**, wait 2-3 seconds before adding policies
3. **Test immediately** after setup to catch any issues
4. **Three green checkmarks** = all policies active and working

---

## 📞 If Something Goes Wrong

| Error | Solution |
|-------|----------|
| "Upload failed" | Check 3 policies exist + you're logged in |
| "Images don't show" | Check "Allow public read" policy exists |
| "Can't delete images" | Check "Allow delete" policy exists + you're logged in |
| "Object not found" | Check bucket name is exactly `project-images` |

---

**Total Setup Time:** 5 minutes ⏱️
**Difficulty:** Easy 🟢
**Support:** See SUPABASE_BUCKET_SETUP.md for detailed guide
