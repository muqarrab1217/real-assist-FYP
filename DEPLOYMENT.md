# Deployment Guide

## Image Display Fix

### Problem
Images (especially the logo) were not displaying after deployment because the `public` folder was being ignored by git.

### Solution Applied

1. **Updated `.gitignore`**
   - Commented out the `public` line (line 88) that was ignoring the entire public directory
   - This ensures all images and assets in `public/` are included in the repository

2. **Enhanced `vite.config.ts`**
   - Added explicit `publicDir: 'public'` configuration
   - Added `base: '/'` to ensure correct asset paths
   - Added `build` configuration with `copyPublicDir: true` to ensure public assets are copied to dist

3. **Created `vercel.json`**
   - Configured proper build settings for Vercel deployment
   - Added URL rewrites for SPA routing
   - Added cache headers for image optimization

## Deployment Steps

### For Vercel

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix: Enable public folder for image deployment"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Detect the changes
   - Run `npm install`
   - Run `npm run build`
   - Deploy the `dist` folder with all public assets

### For Render

1. **Ensure the following settings in Render dashboard:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start` (which runs `vite preview`)
   - Publish Directory: `dist`

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Fix: Enable public folder for image deployment"
   git push origin main
   ```

## Verification

After deployment, verify that:
- ✅ Logo appears on login page (`/images/logo.png`)
- ✅ Logo appears on register page (`/images/logo.png`)
- ✅ Logo appears on forgot password page (`/images/logo.png`)
- ✅ Logo appears in sidebar (`/images/logo.png`)
- ✅ Project images load correctly (Unsplash images from ProjectUpdatesPage)

## Image Paths in Code

All images should use absolute paths from the public directory:
```jsx
// Correct ✅
<img src="/images/logo.png" alt="Logo" />

// Incorrect ❌
<img src="./images/logo.png" alt="Logo" />
<img src="../public/images/logo.png" alt="Logo" />
```

## Troubleshooting

If images still don't appear after deployment:

1. **Check if public folder is committed:**
   ```bash
   git ls-files public/
   ```
   Should show all files in the public directory.

2. **Verify build output:**
   ```bash
   npm run build
   ls -la dist/images/
   ```
   Should show all image files copied to dist.

3. **Check browser console:**
   - Look for 404 errors on image requests
   - Verify the actual URL being requested

4. **Clear deployment cache:**
   - On Vercel: Redeploy with "Clear cache and deploy"
   - On Render: Manual deploy with "Clear build cache"

## Important Notes

- The `public` folder contents are served at the root level in production
- Vite automatically copies `public` folder contents during build
- Never use relative paths for assets in the `public` folder
- Always use absolute paths starting with `/`

