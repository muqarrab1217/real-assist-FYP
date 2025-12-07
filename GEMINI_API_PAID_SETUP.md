# How to Enable Paid Gemini API Access

## Overview

The Gemini API has a **free tier** with rate limits, and a **paid tier** with higher quotas and access to more models. To use the paid version, you need to:

1. Set up billing in Google Cloud Console
2. Enable the Generative AI API
3. Create/update your API key with billing enabled

---

## Step-by-Step Guide

### Step 1: Create or Access Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one:
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Gemini RAG Project")
   - Click "Create"

### Step 2: Enable Billing

**Important:** You need a billing account to access paid API features, even if you stay within free tier limits.

1. In Google Cloud Console, go to **Billing** (search for it in the top search bar)
2. Click **"Link a billing account"** or **"Create billing account"**
3. Fill in your billing information:
   - Country/Region
   - Business or personal account type
   - Payment method (credit card)
4. Complete the setup

**Note:** Google provides $300 in free credits for new accounts, and the Gemini API has a generous free tier, so you likely won't be charged unless you exceed free limits.

### Step 3: Enable Generative AI API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for **"Generative Language API"** or **"Vertex AI API"**
3. Click on **"Generative Language API"**
4. Click **"Enable"**
5. Wait for the API to be enabled (usually takes a few seconds)

### Step 4: Get Your API Key (with Billing Enabled)

#### Option A: Using Google AI Studio (Easiest)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure you're signed in with the same Google account
3. Click **"Create API key"**
4. Select your Google Cloud project (the one with billing enabled)
5. Copy your API key

#### Option B: Using Google Cloud Console

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"API Key"**
3. Copy the API key
4. (Optional) Click "Restrict key" to limit usage to Generative Language API only

### Step 5: Update Your .env File

Update your `.env` file with the new API key:

```env
GEMINI_API_KEY=your_new_api_key_here
VITE_API_BASE_URL=http://localhost:5000
```

### Step 6: Restart Your Backend Server

```bash
npm run dev:backend
```

---

## Pricing Information

### Free Tier Limits
- **60 requests per minute** (RPM)
- **1,500 requests per day** (RPD)
- Access to most models

### Paid Tier Benefits
- **Higher rate limits** (varies by model)
- **Access to all models** including latest versions
- **Better performance** and priority access
- **Custom quotas** available

### Current Pricing (as of 2024)

**Gemini 1.5 Pro:**
- Input: $1.25 per million tokens (first 200K tokens), $2.50 per million (beyond)
- Output: $5.00 per million tokens (first 200K tokens), $10.00 per million (beyond)

**Gemini 1.5 Flash:**
- Input: $0.075 per million tokens (first 200K tokens), $0.30 per million (beyond)
- Output: $0.30 per million tokens (first 200K tokens), $0.60 per million (beyond)

**Note:** Pricing may vary by region. Check [official pricing page](https://ai.google.dev/pricing) for latest rates.

---

## Benefits of Paid Access

✅ **Higher Rate Limits**
- More requests per minute/day
- Better for production applications

✅ **Access to Latest Models**
- Gemini 2.5 Pro
- Gemini 2.0 Flash
- Latest experimental models

✅ **Better Support**
- Priority access to new features
- Technical support options

✅ **Custom Quotas**
- Request higher limits for your use case
- Better for enterprise applications

---

## Monitoring Usage and Costs

### View API Usage

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** > **Dashboard**
3. Select **"Generative Language API"**
4. View your usage metrics and quotas

### Set Up Budget Alerts

1. Go to **Billing** > **Budgets & alerts**
2. Click **"Create budget"**
3. Set a budget amount (e.g., $10/month)
4. Configure alerts to notify you when approaching limits

### Check Current Usage

Visit: [Google Cloud Console - API Usage](https://console.cloud.google.com/apis/dashboard)

---

## Troubleshooting

### "Billing not enabled" Error
- Make sure billing is enabled for your Google Cloud project
- Verify the API key is associated with the correct project

### "Quota exceeded" Error
- Check your current usage in Google Cloud Console
- Consider requesting a quota increase
- Or wait for the rate limit to reset

### "API not enabled" Error
- Go to APIs & Services > Library
- Search for "Generative Language API"
- Click "Enable"

---

## Important Notes

⚠️ **Free Credits**: New Google Cloud accounts get $300 in free credits valid for 90 days

⚠️ **Free Tier**: Even with billing enabled, you get generous free tier limits

⚠️ **Cost Control**: Set up budget alerts to avoid unexpected charges

⚠️ **API Key Security**: Never commit your API key to version control (already in `.gitignore`)

---

## Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [API Documentation](https://ai.google.dev/api)
- [Quota Management](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)

---

## Next Steps

After setting up billing:

1. ✅ Update your `.env` file with the new API key
2. ✅ Restart your backend server
3. ✅ Test the API with: `node test-gemini-models.js`
4. ✅ Monitor usage in Google Cloud Console
5. ✅ Set up budget alerts to track costs

Your application should now have access to paid tier features and higher rate limits!

