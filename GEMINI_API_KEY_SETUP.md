# Gemini API Key Setup Guide

## Issue Fixed
✅ Updated the model from `gemini-pro` (outdated) to `gemini-1.5-flash` (current)

## Getting a New Gemini API Key

If your current API key doesn't work, follow these steps:

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"** or **"Get API key"**
4. Select or create a Google Cloud project
5. Copy your API key (it will look like: `AIzaSy...`)

### Step 2: Update Your .env File

Your `.env` file is located in the project root. Update it with your new API key:

```env
GEMINI_API_KEY=your_new_api_key_here
VITE_API_BASE_URL=http://localhost:5000
```

**Important:** 
- Replace `your_new_api_key_here` with the actual API key you copied
- Do NOT commit the `.env` file to git (it's already in `.gitignore`)

### Step 3: Restart the Backend Server

After updating the API key, restart your backend server:

```bash
# Stop the current server (Ctrl+C if running)
# Then restart it:
npm run dev:backend
```

## Available Gemini Models

The code now uses `gemini-1.5-flash` which is:
- ✅ Fast and efficient
- ✅ Cost-effective
- ✅ Good for most RAG use cases

If you need more advanced capabilities, you can change it to `gemini-1.5-pro` in `ragBot/server/index.js` (line 273).

## Troubleshooting

### Error: "API key not valid"
- Make sure you copied the entire API key
- Check that there are no extra spaces in your `.env` file
- Verify the API key is active in Google AI Studio

### Error: "Model not found"
- The model name has been updated to `gemini-1.5-flash`
- If you still get this error, try `gemini-1.5-pro` instead

### Error: "Quota exceeded"
- Free tier has rate limits
- Check your usage in Google AI Studio
- Consider upgrading to a paid plan if needed

## Testing Your Setup

1. Make sure the backend is running: `npm run dev:backend`
2. Check the health endpoint: Open `http://localhost:5000/api/health` in your browser
3. Try uploading a document through the frontend
4. Test the chatbot

## Security Note

⚠️ **Never share your API key publicly!**
- Keep your `.env` file private
- Don't commit it to version control
- Don't share it in screenshots or documentation

