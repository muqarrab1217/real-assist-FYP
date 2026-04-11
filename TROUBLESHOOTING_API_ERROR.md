# ⚠️ TROUBLESHOOTING: Cannot POST /api/chatbot/chat/create

## The Problem
You're getting an HTML error page saying:
```
Cannot POST /api/chatbot/chat/create
```

This means **the backend server is NOT running** or you're hitting the wrong port.

---

## ✅ SOLUTION (Do this NOW)

### Step 1: Start the Backend Server

Open a **NEW terminal/command prompt** and run:

```bash
cd d:\FYP\FYP
npm run dev:backend
```

You should see:
```
ragBot API server running on port 10000
Make sure to set GEMINI_API_KEY environment variable
```

**⚠️ IMPORTANT: Keep this terminal window OPEN - Don't close it!**

---

### Step 2: Verify Backend is Running

Open your browser and visit:
```
http://localhost:10000
```

- If you see "Cannot GET /" → Backend IS running (this is normal, root route doesn't exist)
- If browser can't connect → Backend is NOT running

---

### Step 3: Use Correct URL in Postman

Make sure you're using the **CORRECT** URL:

✅ **CORRECT:**
```
http://localhost:10000/api/chatbot/chat/create
```

❌ **WRONG:**
```
http://localhost:5173/api/chatbot/chat/create  (this is frontend port)
http://localhost:10000/api/gemini/chat/create  (old endpoint name)
https://localhost:10000/...                     (use http, not https)
```

---

### Step 4: Postman Configuration

**Method:** POST

**URL:** `http://localhost:10000/api/chatbot/chat/create`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "title": "Test Chat",
  "description": "Testing from Postman"
}
```

---

## 🔍 Common Issues & Fixes

### Issue 1: Backend Not Running
**Symptoms:** Cannot connect, "Cannot POST" error

**Fix:**
```bash
cd d:\FYP\FYP
npm run dev:backend
```

---

### Issue 2: Port 10000 Already in Use
**Symptoms:** Error says port is already in use

**Fix (Windows):**
```bash
# Find process using port 10000
netstat -ano | findstr :10000

# Kill the process (replace PID with actual number)
taskkill /PID <process-id> /F

# Restart backend
npm run dev:backend
```

---

### Issue 3: Missing Environment Variables
**Symptoms:** Server starts but crashes or errors

**Fix:** Create `.env` file in `d:\FYP\FYP\` with:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

---

### Issue 4: Wrong Postman URL
**Symptoms:** "Cannot POST" error

**Fix:** Double-check URL is:
- `http://localhost:10000` (backend port)
- NOT `http://localhost:5173` (frontend port)
- Includes `/api/chatbot/` (not `/api/gemini/`)

---

### Issue 5: Missing JWT Token
**Symptoms:** "User not authenticated" error

**Fix:** Get token from browser:
1. Login at `http://localhost:5173`
2. Open DevTools (F12) → Console
3. Paste: `localStorage.getItem('sb-[your-project-id]-auth-token')`
4. Copy the `access_token` value
5. Use in Postman header: `Authorization: Bearer <token>`

---

## 📋 Quick Checklist

Before testing in Postman, verify:

- [ ] Backend server is running (`npm run dev:backend`)
- [ ] Console shows "ragBot API server running on port 10000"
- [ ] Using URL: `http://localhost:10000/api/chatbot/chat/create`
- [ ] Method is POST (not GET)
- [ ] Header: `Content-Type: application/json`
- [ ] Header: `Authorization: Bearer <your-jwt-token>`
- [ ] Body is valid JSON format
- [ ] No typos in URL or headers

---

## 🧪 Test with cURL (Alternative)

If Postman doesn't work, try cURL to isolate the issue:

```bash
curl -X POST http://localhost:10000/api/chatbot/chat/create ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"title\": \"Test Chat\"}"
```

- If cURL works → Problem is Postman configuration
- If cURL fails → Problem is backend server

---

## 🆘 Still Not Working?

1. **Check backend console** for error messages
2. **Restart both servers:**
   ```bash
   # Stop backend (Ctrl+C in terminal)
   # Stop frontend (Ctrl+C in terminal)
   
   # Start backend
   npm run dev:backend
   
   # In another terminal, start frontend
   npm run dev
   ```
3. **Verify route exists** in `ragBot/server/index.cjs`:
   - Search for `app.post('/api/chatbot/chat/create'`
   - Make sure line exists and no syntax errors

---

## ✅ Expected Success Response

When everything works, you should get:

```json
{
  "success": true,
  "chat": {
    "id": "uuid-here",
    "user_id": "d218057f-13e3-4871-9ab6-0e612c30f0a1",
    "title": "Test Chat",
    "description": "Testing from Postman",
    "created_at": "2026-03-28T10:35:00.000Z",
    "updated_at": "2026-03-28T10:35:00.000Z",
    "total_messages": 0,
    "status": "active"
  }
}
```

---

## 🎯 TL;DR (Too Long; Didn't Read)

1. Open terminal → `cd d:\FYP\FYP`
2. Run → `npm run dev:backend`
3. Wait for → "ragBot API server running on port 10000"
4. In Postman → `http://localhost:10000/api/chatbot/chat/create`
5. Headers → `Content-Type: application/json` + `Authorization: Bearer TOKEN`
6. Body → `{"title": "Test"}`
7. Click Send!
