# Gemini RAG Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

A `.env` file has been created with your Gemini API key. It should contain:

```env
GEMINI_API_KEY=AIzaSyAnFq9TFHPejyMGcMMpyjcbUdFOUNZpTcs
VITE_API_BASE_URL=http://localhost:5000
```

**Note:** The `.env` file is gitignored for security.

### 3. Start the Backend Server

Open a new terminal and run:

```bash
npm run dev:backend
```

The backend will run on `http://localhost:5000`.

### 4. Start the Frontend (in a separate terminal)

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:all
```

### 5. Upload Documents

1. Log in as an admin user
2. Navigate to `/admin/rag-upload`
3. Upload PDF, DOCX, or TXT files containing real estate information
4. The files will be processed and added to the Gemini corpus

### 6. Use the Chatbot

The RAG chatbot appears as a purple gradient floating button in the bottom-right corner of all pages. Click it to start chatting!

## Project Structure

```
gemini-rag/
├── server/
│   └── index.js          # Express backend with Gemini API
├── components/
│   └── RagChatbot.tsx    # React chatbot widget
├── config/               # Auto-generated (gitignored)
│   ├── corpus-config.json
│   └── files-registry.json
└── uploads/              # Temporary files (gitignored)
```

## API Endpoints

- `POST /api/gemini/upload` - Upload documents
- `POST /api/gemini/query` - Query the RAG system
- `GET /api/health` - Health check

## Features Implemented

✅ Backend Express server with Gemini File Search API
✅ File upload endpoint with corpus management
✅ RAG query endpoint with retrieval
✅ React chatbot widget (bottom-right corner)
✅ Admin upload page at `/admin/rag-upload`
✅ Corpus ID stored in config file
✅ Clean, minimal UI that doesn't clash with existing design

## Troubleshooting

**Backend won't start:**
- Make sure `GEMINI_API_KEY` is set in `.env`
- Check if port 5000 is available

**Chatbot not appearing:**
- Make sure the backend is running on port 5000
- Check browser console for errors
- Verify `VITE_API_BASE_URL` in `.env` matches backend URL

**Upload fails:**
- Check file size (max 50MB)
- Ensure file is PDF, DOCX, or TXT
- Check backend server logs

## Next Steps

1. Upload your real estate documents via the admin page
2. Test the chatbot with questions about the uploaded documents
3. The corpus persists between server restarts (stored in `gemini-rag/config/`)

