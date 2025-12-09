# Data Flow Diagram (DFD) for RAG Chatbot System

## Software Recommendations

### 1. **Lucidchart** (Recommended)
- **URL**: https://www.lucidchart.com/
- **Pros**: 
  - Professional DFD templates
  - Gane and Sarson notation support
  - Easy collaboration
  - Export to multiple formats
- **Cons**: Free tier has limitations

### 2. **Draw.io (diagrams.net)** (Free & Best for Starters)
- **URL**: https://app.diagrams.net/ or https://www.draw.io/
- **Pros**: 
  - Completely free
  - No account needed
  - Can save to Google Drive, GitHub, etc.
  - Has DFD shapes library
- **Cons**: Less polished than Lucidchart

### 3. **Microsoft Visio**
- **Pros**: Professional, industry standard
- **Cons**: Paid software, Windows only

### 4. **PlantUML** (Text-based)
- **URL**: http://plantuml.com/
- **Pros**: Version control friendly, text-based
- **Cons**: Less visual, requires learning syntax

## DFD Structure for RAG Chatbot System

Based on your images, we'll use **Gane and Sarson notation**:
- **Process**: Rounded rectangle with horizontal line at top
- **Data Store**: Rectangle with vertical line on left (file cabinet)
- **External Entity**: 3D cube shape
- **Data Flow**: Arrows with labels

---

## Level 0: Context Diagram

**External Entities:**
- ADMIN
- USER

**System:** RAG Chatbot System

**Data Flows:**

**ADMIN → System:**
- Login Credentials
- Document Upload Request
- Document File

**System → ADMIN:**
- Authentication Response
- Upload Confirmation
- Upload Status

**USER → System:**
- Chat Query
- Login Credentials (if authenticated)

**System → USER:**
- Chat Response
- Authentication Response

---

## Level 1 DFD

**Processes:**
1. **1.0 Authenticate User** - Handles login for admin and users
2. **2.0 Upload Document** - Processes document uploads from admin
3. **3.0 Process Document** - Creates tokens and embeddings
4. **4.0 Query Chatbot** - Handles user queries and generates responses

**Data Stores:**
- D1: USER_CREDENTIALS
- D2: UPLOADED_DOCUMENTS
- D3: DOCUMENT_EMBEDDINGS
- D4: CHAT_HISTORY

**External Entities:**
- ADMIN
- USER

**Data Flows:**

**ADMIN → 1.0 Authenticate User:**
- Login Credentials

**1.0 Authenticate User → D1 USER_CREDENTIALS:**
- Read: Verify Credentials
- Write: Store Credentials (if new user)

**1.0 Authenticate User → ADMIN:**
- Authentication Response

**ADMIN → 2.0 Upload Document:**
- Document File
- Upload Request

**2.0 Upload Document → D2 UPLOADED_DOCUMENTS:**
- Write: Document Data
- Write: File Metadata

**2.0 Upload Document → 3.0 Process Document:**
- Process Request

**2.0 Upload Document → ADMIN:**
- Upload Confirmation

**3.0 Process Document → D2 UPLOADED_DOCUMENTS:**
- Read: Document Content

**3.0 Process Document → D3 DOCUMENT_EMBEDDINGS:**
- Write: Tokens
- Write: Embeddings
- Write: Document Index

**USER → 4.0 Query Chatbot:**
- Chat Query

**4.0 Query Chatbot → D3 DOCUMENT_EMBEDDINGS:**
- Read: Search Embeddings
- Read: Retrieve Relevant Content

**4.0 Query Chatbot → D4 CHAT_HISTORY:**
- Write: Query
- Write: Response

**4.0 Query Chatbot → USER:**
- Chat Response

---

## Level 2 DFD - Process 2.0: Upload Document

**Sub-processes:**
- **2.1 Validate Document** - Check file type, size
- **2.2 Store Document** - Save to backend folder
- **2.3 Update Registry** - Update file registry

**Data Stores:**
- D2: UPLOADED_DOCUMENTS
- D5: FILE_REGISTRY

**Data Flows:**

**ADMIN → 2.1 Validate Document:**
- Document File

**2.1 Validate Document → 2.2 Store Document:**
- Validated Document

**2.2 Store Document → D2 UPLOADED_DOCUMENTS:**
- Write: File Content
- Write: File Path

**2.2 Store Document → 2.3 Update Registry:**
- File Metadata

**2.3 Update Registry → D5 FILE_REGISTRY:**
- Write: File Entry

**2.3 Update Registry → 3.0 Process Document:**
- Process Request

**2.1 Validate Document → ADMIN:**
- Validation Error (if invalid)

**2.3 Update Registry → ADMIN:**
- Upload Confirmation

---

## Level 2 DFD - Process 3.0: Process Document

**Sub-processes:**
- **3.1 Extract Text** - Extract text from PDF/DOCX
- **3.2 Create Tokens** - Tokenize the text
- **3.3 Generate Embeddings** - Create vector embeddings
- **3.4 Store Embeddings** - Save to embedding store

**Data Stores:**
- D2: UPLOADED_DOCUMENTS
- D3: DOCUMENT_EMBEDDINGS
- D6: CORPUS_CONFIG

**Data Flows:**

**2.0 Upload Document → 3.1 Extract Text:**
- Process Request

**3.1 Extract Text → D2 UPLOADED_DOCUMENTS:**
- Read: Document Content

**3.1 Extract Text → 3.2 Create Tokens:**
- Extracted Text

**3.2 Create Tokens → 3.3 Generate Embeddings:**
- Tokenized Text

**3.3 Generate Embeddings → 3.4 Store Embeddings:**
- Embedding Vectors

**3.4 Store Embeddings → D3 DOCUMENT_EMBEDDINGS:**
- Write: Embeddings
- Write: Document Index

**3.4 Store Embeddings → D6 CORPUS_CONFIG:**
- Write: Corpus ID
- Write: Corpus Metadata

---

## Level 2 DFD - Process 4.0: Query Chatbot

**Sub-processes:**
- **4.1 Process Query** - Understand user query
- **4.2 Search Embeddings** - Find relevant documents
- **4.3 Generate Response** - Create answer using RAG
- **4.4 Return Response** - Send response to user

**Data Stores:**
- D3: DOCUMENT_EMBEDDINGS
- D4: CHAT_HISTORY
- D2: UPLOADED_DOCUMENTS

**Data Flows:**

**USER → 4.1 Process Query:**
- Chat Query

**4.1 Process Query → 4.2 Search Embeddings:**
- Processed Query
- Query Embedding

**4.2 Search Embeddings → D3 DOCUMENT_EMBEDDINGS:**
- Read: Search Similar Embeddings

**4.2 Search Embeddings → D2 UPLOADED_DOCUMENTS:**
- Read: Retrieve Document Content

**4.2 Search Embeddings → 4.3 Generate Response:**
- Relevant Content
- Context

**4.3 Generate Response → 4.4 Return Response:**
- Generated Answer

**4.4 Return Response → D4 CHAT_HISTORY:**
- Write: Query
- Write: Response

**4.4 Return Response → USER:**
- Chat Response

---

## Step-by-Step Guide for Draw.io

1. **Go to**: https://app.diagrams.net/
2. **Create New Diagram**: Choose "Blank Diagram"
3. **Add Shapes Library**:
   - Click "More Shapes" (bottom left)
   - Search for "DFD" or "Data Flow"
   - Enable DFD shapes library

4. **Draw Context Diagram (Level 0)**:
   - Add rectangle (External Entity) for ADMIN
   - Add rectangle (External Entity) for USER
   - Add rounded rectangle (Process) for "RAG Chatbot System"
   - Connect with arrows and label data flows

5. **Draw Level 1 DFD**:
   - Create 4 processes (1.0, 2.0, 3.0, 4.0)
   - Add data stores (rectangles with vertical line)
   - Connect all flows

6. **Draw Level 2 DFDs**:
   - Expand each process from Level 1
   - Show sub-processes
   - Connect to data stores

## Tips

- Use consistent naming conventions
- Number processes hierarchically (1.0, 1.1, 1.2, etc.)
- Label all data flows clearly
- Keep data stores consistent across levels
- Use different colors for different entity types (optional)

