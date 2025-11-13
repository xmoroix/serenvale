# Serenvale Implementation Strategy

## What We're Keeping from LobeChat

### ✅ Backend Systems (100% Reuse)
- **RAG System**: `chunks`, `embeddings` tables with vector support (1024 dimensions)
  - Perfect for RadLex medical terminology
  - Already configured with pgvector
- **Knowledge Base**: `knowledgeBases`, `knowledgeBaseFiles`
  - Use for medical protocols, guidelines, RadLex database
- **Agent System**: `agents` table
  - Create modality-specific agents (IRM_FR, TDM_EN, etc.)
- **Files System**: `files`, `globalFiles`
  - Store DICOM metadata, generated PDFs, signatures
- **Message/Session**: Existing chat system
  - Use as-is for AI dictation interface

### ✅ Packages to Leverage
- `packages/database` - Drizzle ORM + PGLite
- `packages/model-runtime` - OpenAI integration (Whisper, GPT)
- `packages/context-engine` - RAG engine
- `packages/agent-runtime` - Agent execution
- `packages/file-loaders` - File processing

### ✅ UI Components to Keep
- `/chat` - Entire chat interface (our dictation UI)
- Settings system architecture
- i18n (FR/EN already supported)
- Theme system

## What We're Adding

### 1. New Database Schemas
Add to `packages/database/src/schemas/`:

```typescript
// radiology.ts
export const studies = pgTable('studies', {
  id: text('id').$defaultFn(() => idGenerator('studies')).primaryKey(),
  pacsId: text('pacs_id').notNull(), // StudyInstanceUID
  metadata: jsonb('metadata'), // Patient name, date, modality, etc.
  modality: text('modality'), // IRM, TDM, RAD, ECHO
  priority: text('priority'), // STAT, Routine
  fetchedAt: timestamp('fetched_at'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
});

export const reports = pgTable('reports', {
  id: text('id').$defaultFn(() => idGenerator('reports')).primaryKey(),
  studyId: text('study_id').references(() => studies.id),
  version: integer('version').default(1),
  parentId: text('parent_id'), // For versioning
  content: text('content'), // Report text
  status: text('status'), // draft, final, signed, sent
  language: text('language'), // fr, en
  agentId: text('agent_id'), // Which modality agent was used
  pdfBlob: text('pdf_blob'), // Base64 PDF or file path
  signedAt: timestamp('signed_at'),
  sentAt: timestamp('sent_at'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
});
```

### 2. New Settings Tabs
Extend `SettingsTabs` enum in `src/store/global/initialState.ts`:

```typescript
export enum SettingsTabs {
  // ... existing tabs
  PACS = 'pacs',
  Clinic = 'clinic',
  Doctor = 'doctor',
  Printer = 'printer',
}
```

Create folders:
- `src/app/[variants]/(main)/settings/pacs/` - PACS connection settings
- `src/app/[variants]/(main)/settings/clinic/` - Clinic info, logo, letterhead
- `src/app/[variants]/(main)/settings/doctor/` - Doctor signature, stamp
- `src/app/[variants]/(main)/settings/printer/` - Printer configuration

### 3. New Pages
Following LobeChat's `/chat` pattern:

#### `/worklist` - PACS Worklist
```
src/app/[variants]/(main)/worklist/
  ├── _layout/
  │   ├── Desktop/
  │   └── Mobile/
  ├── features/
  │   ├── QueryPanel/
  │   ├── StudyTable/
  │   └── WeasisLauncher/
  ├── page.tsx
  └── layout.tsx
```

#### `/reports` - Finished Reports List
```
src/app/[variants]/(main)/reports/
  ├── _layout/
  ├── features/
  │   ├── ReportsTable/
  │   ├── PDFViewer/
  │   └── PrintDialog/
  └── page.tsx
```

### 4. DICOM Integration
Create `packages/dicom/` (new package):
- C-FIND client (query PACS)
- C-STORE client (send PDF reports)
- DICOM metadata parser
- Weasis launcher

## Implementation Steps

### Phase 1: Database Setup
1. Add `radiology.ts` schema
2. Generate and run migrations
3. Seed RadLex data into knowledge base

### Phase 2: Settings Pages
1. Add PACS settings tab
2. Add Clinic settings tab
3. Add Doctor settings tab
4. Add Printer settings tab

### Phase 3: Worklist Page
1. Create `/worklist` route
2. Implement C-FIND integration
3. Cache studies in database
4. Add Weasis launcher

### Phase 4: Reports Page
1. Create `/reports` route
2. List finished reports
3. PDF generation
4. Print functionality
5. C-STORE to PACS

### Phase 5: Integration
1. Connect `/chat` to report generation
2. Auto-populate report from study
3. Link modality agents
4. Version control for reports

## Settings Configuration

### PACS Settings
- AE Title (Application Entity)
- PACS IP/Port
- Query Node (C-FIND)
- Store Node (C-STORE)
- Default query filters

### Clinic Settings
- Clinic name
- Address
- NIF/Tax ID
- Logo upload
- Letterhead template (HTML)

### Doctor Settings
- Doctor name
- Specialty
- License number
- Signature (image upload or draw)
- Digital stamp

### Printer Settings
- Network printer name
- Default paper size (A4/Letter)
- Print quality

## Next Steps

Ready to implement? Let's start with:
1. ✅ Database schemas (easiest, foundation)
2. ✅ Settings tabs (UI work, visible progress)
3. ✅ `/worklist` page (core functionality)
4. ✅ `/reports` page (complete the workflow)

Which would you like to tackle first?
