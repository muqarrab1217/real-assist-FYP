# Gemini RAG Chatbot Integration

This directory contains the Gemini File Search (Corpus-based RAG) integration for the real estate website.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:5000
```

**Important:** The `.env` file is gitignored for security. Make sure to create it manually.

### 3. Start the Backend Server

The backend API server runs on port 5000 by default.

```bash
npm run dev:backend
```

Or run both frontend and backend together:

```bash
npm run dev:all
```

### 4. Upload Documents

1. Navigate to `/admin/rag-upload` (requires admin role)
2. Upload PDF, DOCX, or TXT files containing real estate information
3. Files will be processed and added to the Gemini corpus automatically

### 5. Use the Chatbot

The RAG chatbot widget appears as a floating button in the bottom-right corner of all pages. Users can ask questions about the uploaded real estate documents.

## API Endpoints

### `POST /api/gemini/upload`
Upload a document to the Gemini corpus.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with a `file` field (PDF, DOCX, or TXT, max 50MB)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "corpusId": "real-estate-corpus-1234567890",
  "fileName": "property-listings.pdf",
  "fileId": "1234567890"
}
```

### `POST /api/gemini/query`
Query the RAG system with a user message.

**Request:**
```json
{
  "message": "What properties are available?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on the uploaded documents..."
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "ragBot-api"
}
```

## Project Structure

```
ragBot/
├── server/
│   └── index.js          # Express backend server
├── components/
│   └── RagChatbot.tsx    # React chatbot widget component
├── config/               # Auto-generated config (gitignored)
│   ├── corpus-config.json
│   └── files-registry.json
└── uploads/              # Temporary upload storage (gitignored)
```

## Configuration Files

- `corpus-config.json`: Stores the Gemini corpus ID (auto-generated)
- `files-registry.json`: Registry of uploaded files and their metadata

Both files are automatically created and managed by the backend server.

## Notes

- The corpus is created automatically on the first file upload
- All uploaded documents are indexed in the same corpus
- The chatbot uses Gemini 1.5 Pro with File Search (Retrieval) tool
- Files are temporarily stored during processing, then cleaned up

