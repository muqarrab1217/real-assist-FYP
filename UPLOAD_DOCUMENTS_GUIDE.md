# How to Upload Documents to the Gemini RAG Corpus

## Quick Steps

### Option 1: Through Admin Panel (Recommended)

1. **Start the backend server** (if not already running):
   ```bash
   npm run dev:backend
   ```

2. **Start the frontend** (if not already running):
   ```bash
   npm run dev
   ```

3. **Login as Admin**:
   - Go to `http://localhost:3000/auth/login`
   - Select "Admin" role
   - Enter any email and password (this is a mock authentication)
   - Click "Sign In"

4. **Navigate to Upload Page**:
   - After logging in, you'll be on the Admin Dashboard
   - Go to: `http://localhost:3000/admin/rag-upload`
   - Or navigate using the sidebar menu if it has a link

5. **Upload Documents**:
   - Click "Choose a file" or drag and drop
   - Select a PDF, DOCX, or TXT file (max 50MB)
   - Click "Upload to Corpus"
   - Wait for the success message

6. **Test the Chatbot**:
   - Close the admin panel
   - Use the chatbot widget (gold button, bottom-right)
   - Ask questions about your uploaded documents!

### Option 2: Direct URL Access (If Auth is Bypassed)

If authentication is set to allow direct access, you can go directly to:
```
http://localhost:3000/admin/rag-upload
```

## Example Documents to Upload

You can upload any of these file types:
- **PDF**: Property listings, brochures, documents
- **DOCX**: Word documents with property information
- **TXT**: Plain text files with property details

Example files you might have:
- Property listings PDFs
- Project brochures
- Terms and conditions
- FAQ documents
- Any real estate related documents

## Troubleshooting

### "No corpus found" Error
- **Solution**: You need to upload at least one document first using the upload page
- The corpus is created automatically on the first upload

### Upload Fails
- **Check**: Make sure the backend server is running (`npm run dev:backend`)
- **Check**: File must be PDF, DOCX, or TXT and under 50MB
- **Check**: Look at the browser console for detailed error messages

### Can't Access Upload Page
- **Check**: You're logged in as an admin
- **Check**: The URL is correct: `/admin/rag-upload`
- **Try**: Log out and log back in as admin

## Important Notes

- The corpus persists between server restarts (stored in `gemini-rag/config/`)
- You can upload multiple documents - they all go into the same corpus
- The chatbot will use all uploaded documents to answer questions
- Documents are processed automatically - no manual indexing needed

