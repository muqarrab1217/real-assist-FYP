# Render Deployment Guide for RAG Backend

## Overview
This guide explains how to deploy only the RAG backend to Render.com on the `ragBot` branch.

## Prerequisites
- GitHub repository with `ragBot` branch
- Render.com account
- Gemini API key

## Step 1: Configure Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the **`ragBot`** branch
5. Configure the service:
   - **Name**: `rag-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:backend`
   - **Plan**: Free (or your preferred plan)

## Step 2: Set Environment Variables

In the Render dashboard, go to **Environment** and add:

- **NODE_ENV**: `production`
- **PORT**: `5000` (Render will override this, but set it anyway)
- **GEMINI_API_KEY**: Your Gemini API key from Google AI Studio

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start the backend with `npm run start:backend`
3. Wait for deployment to complete
4. Your backend will be available at: `https://your-service-name.onrender.com`

## Step 4: Update Frontend Configuration

Update your frontend `.env` file or environment variables:

```env
VITE_API_BASE_URL=https://your-service-name.onrender.com
```

Or if using Render for frontend too, set it in the frontend service's environment variables.

## Backend Endpoints

Once deployed, your backend will be available at:
- Health check: `https://your-service-name.onrender.com/api/health`
- Query: `https://your-service-name.onrender.com/api/gemini/query`
- Upload: `https://your-service-name.onrender.com/api/gemini/upload`

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify `GEMINI_API_KEY` is set correctly
- Ensure `PORT` environment variable is set

### CORS errors
- The backend already has CORS enabled with `app.use(cors())`
- If issues persist, check the CORS configuration in `ragBot/server/index.js`

### Timeout errors
- Render free tier has request timeouts
- Consider upgrading to a paid plan for longer timeouts
- Or optimize your API responses

## Notes

- The `render.yaml` file is optional but recommended for infrastructure as code
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider using a paid plan for production use

