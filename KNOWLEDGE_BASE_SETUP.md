# Knowledge Base Setup Guide

## Why Knowledge Base Requires Server Mode

The **Knowledge Base** feature uses **RAG (Retrieval Augmented Generation)** which requires:

1. **PostgreSQL with pgvector extension** for vector similarity search
2. **Vector embeddings** (1024-dimensional) stored in the database
3. **Document chunking** and processing pipeline
4. **Embedding generation** via OpenAI or other providers

### Database Schema

```typescript
// Vector embeddings table (requires pgvector)
embeddings {
  id: uuid
  chunkId: uuid → chunks.id
  embeddings: vector(1024)  // ⚠️ Requires pgvector extension
  model: text
  userId: text
}

// Document chunks table
chunks {
  id: uuid
  text: text
  abstract: text
  metadata: jsonb
  index: integer
  userId: text
}

// Knowledge bases table
knowledge_bases {
  id: text
  name: text
  description: text
  type: text
  userId: text
  settings: jsonb
}
```

### Why PGLite (Client Mode) Cannot Support This

- **PGLite** is a WASM PostgreSQL database that runs in the browser
- **pgvector** extension (for `vector` column type) is NOT available in PGLite
- Vector similarity search requires native PostgreSQL with pgvector compiled extension

---

## Option 1: Enable Server Mode (Recommended for Production)

This gives you full RAG functionality with medical protocols and guidelines.

### Step 1: Set Up PostgreSQL with pgvector

#### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: ankane/pgvector:latest  # PostgreSQL with pgvector
    environment:
      POSTGRES_DB: serenvale
      POSTGRES_USER: serenvale
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start the database:
```bash
docker-compose up -d
```

#### Using Neon (Managed PostgreSQL with pgvector)

1. Sign up at https://neon.tech
2. Create a new project
3. pgvector extension is automatically enabled
4. Copy the connection string

#### Using Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install pgvector extension
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Enable extension in your database
psql -U postgres -d serenvale
CREATE EXTENSION vector;
```

### Step 2: Configure Environment Variables

Edit `.env.local`:

```bash
########################################
########## Server Database #############
########################################

# Enable server mode
NEXT_PUBLIC_SERVICE_MODE=server

# PostgreSQL connection string
DATABASE_URL=postgresql://serenvale:your_secure_password@localhost:5432/serenvale

# Encryption key for API keys (generate with: openssl rand -base64 32)
KEY_VAULTS_SECRET=your_generated_secret_key_here

# Embedding model configuration
DEFAULT_FILES_CONFIG="embedding_model=openai/text-embedding-3-small,query_mode=full_text"

########################################
####### OpenAI (for embeddings) ########
########################################

# Required for generating embeddings
OPENAI_API_KEY=sk-your-openai-api-key
```

### Step 3: Run Database Migrations

```bash
# Install dependencies
bun install

# Run migrations to create tables
bun run db:migrate:server
```

### Step 4: Start Application

```bash
bun run dev
```

**Knowledge Base will now be available** in the sidebar and chat input!

---

## Option 2: Skip Knowledge Base for Now (Demo/Testing)

If you want to focus on **PACS + OpenAI integration** first:

### What Works Without Knowledge Base:

✅ **Worklist** - PACS C-FIND queries for studies
✅ **Chat with AI** - OpenAI generates radiology reports
✅ **Report Editor** - Edit and finalize reports
✅ **File Upload** - Upload images, previous reports, DICOM files
✅ **Speech-to-Text** - Dictate findings (browser STT or OpenAI Whisper)

### What's Missing:

❌ **Knowledge Base** - Cannot upload medical protocols/guidelines for RAG
❌ **Context-Aware AI** - AI won't reference institutional protocols

### How to Proceed:

1. **Keep current setup** with PGLite (client mode)
2. **Test PACS integration** and report generation workflow
3. **Enable server mode later** when ready to deploy with RAG

The "server version required" message will continue to appear for Knowledge Base, but all other features work normally.

---

## Option 3: Hybrid Approach (Recommended for Demo)

**For demonstration purposes**, you can:

1. **Use client mode** (PGLite) for local development
2. **Set up a temporary PostgreSQL** with Docker for testing knowledge base
3. **Switch between modes** using `NEXT_PUBLIC_SERVICE_MODE` environment variable

```bash
# Development without knowledge base
NEXT_PUBLIC_SERVICE_MODE=client  # (or omit this variable)

# Testing with knowledge base
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=postgresql://localhost:5432/serenvale
```

---

## Testing the Complete Workflow

Once server mode is enabled:

### 1. Upload Medical Protocols to Knowledge Base

- Click **Knowledge Base** icon in sidebar
- Create a new knowledge base (e.g., "Chest X-Ray Protocols")
- Upload PDF documents (ACR guidelines, institutional protocols)
- Files are automatically chunked and embedded

### 2. Assign Knowledge Base to Session

- In chat input, click **Knowledge Base** dropdown
- Select your knowledge base
- AI will now reference these protocols when generating reports

### 3. Full Radiology Workflow

1. **Worklist** → Select a study
2. **Chat** → AI has access to:
   - Study metadata (patient, modality, date)
   - Uploaded images/DICOM files
   - Knowledge base protocols (RAG)
3. **Generate Report** → AI creates context-aware report
4. **Report Editor** → Edit and finalize
5. **Save** → Store in Reports page

---

## Recommended Next Steps

Based on your goals:

### For Demo/Testing:
1. ✅ Keep current setup (client mode)
2. ✅ Test Worklist → Chat → Report Editor workflow
3. ✅ Use file upload for images (without knowledge base)
4. ⏳ Add server mode later for RAG functionality

### For Production:
1. Set up PostgreSQL with pgvector (Neon or Docker)
2. Configure server mode environment variables
3. Run database migrations
4. Upload institutional protocols to knowledge base
5. Test complete RAG workflow

---

## Questions to Decide:

1. **Do you want to enable server mode now?**
   - If yes: I can help set up Docker Compose with PostgreSQL
   - If no: We continue with current setup and skip knowledge base

2. **What's your deployment target?**
   - Local development only: PGLite is fine
   - Production deployment: Need server mode with PostgreSQL

3. **Priority for demo:**
   - Focus on PACS integration first?
   - Or show RAG with medical protocols?

Let me know how you'd like to proceed!
