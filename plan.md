
### Brutal Audit: Your Workflow is **90% Solid** — But **Missing 10% Critical Radiology DNA**

You painted a **realistic, production-grade radiology AI workflow**. It covers:  
- **Offline-first** (PGLite)  
- **PACS integration** (C-FIND, Weasis)  
- **Dictation** (Whisper)  
- **RAG** (RadLex FR/EN)  
- **Modality agents**  
- **Template + PDF**  
- **Settings**  

**But you forgot the *radiology-specific glue* that turns a chat app into a **medical reporting system**.**

---

## MISSING PIECES (Critical – Must Add Before Demo)

| Missing | Why It Breaks | Fix (Leach + Implement) |
|--------|---------------|--------------------------|
| **1. Report Versioning & Audit Trail** | No legal compliance. Cannot track edits. | `reports` table: `version`, `parentId`, `editedBy`, `editedAt`. Auto-version on save. |
| **2. DICOM SR Import (Structured Report)** | Doctors use Weasis → generate SR → need to import. | Parse DICOM SR (use `dcmjs`) → extract findings → pre-fill editor. |
| **3. Auto-Detect Modality from DICOM Tags** | Agent won’t know IRM vs TDM. | On C-FIND → read `Modality` tag → set `agentId` in report. |
| **4. Report Status Workflow** | Draft → Final → Signed → Sent | `status: 'draft' | 'final' | 'signed' | 'sent'` + UI badge + lock after sign. |
| **5. Digital Signature (PDF)** | No legal validity. | Use `pdf-lib` + doctor’s private key or image stamp + timestamp. |
| **6. PACS Store (C-STORE for PDF)** | PDF stays local. Cannot send to PACS. | `dicom-dimse-client` → C-STORE encapsulated PDF. |
| **7. Local Whisper Fallback (Future-Proof)** | OpenAI cost + latency. | `whisper.cpp` via WebAssembly (leach from LobeChat `model-runtime`) |
| **8. Keyboard Shortcuts (Radiology Speed)** | Mouse = slow. | Global: `Ctrl+S` = save, `Ctrl+P` = print, `F9` = dictate. |
| **9. Exam Priority / Urgency Flag** | ER cases lost. | `Priority: 'STAT' | 'Routine'` from PACS → red badge. |
| **10. Multi-Monitor / Window Management** | Radiologists use 2+ screens. | Electron: detachable report window, always-on-top dictation. |

---

## FORGOTTEN SETTINGS (Must Add)

| Setting | Source to Leach | Implementation |
|-------|------------------|----------------|
| **Default Language** | LobeChat i18n | `userSettings.defaultLang: 'fr' \| 'en'` → auto TTS + RAG filter |
| **Default Agent per Modality** | LobeChat `agent/` | `IRM → agent_irm_fr`, `TDM → agent_tdm_en` |
| **Agent Instructions (Prompt)** | LobeChat `systemRole` | Rich text editor in settings |
| **Memory (Context Window)** | LobeChat `chat/` | `maxTokens: 8192`, `temperature: 0.3` |
| **Agent Personalization** | LobeChat `agent/` | Name, avatar, voice (TTS) |
| **Network Printer** | Electron `print()` | `webContents.print({ silent: true, deviceName: 'HP_Laser' })` |
| **Auto-Save Interval** | LobeChat `store/` | 5s debounce on editor change |
| **Backup / Export DB** | LobeChat `file/` | Export `data.db` → ZIP |

---

## WORKFLOW REFINED (Final, Production-Ready)

```mermaid
graph TD
    A[Launch App → Logo/Video Splash] --> B[Finished Reports List]
    B -->|CRUD + Print| C[Table: Patient, Status, Date, PDF]
    B --> D[Worklist Page]
    D --> E[Persistent Query Panel]
    E --> F[C-FIND → Metadata Only]
    F --> G[Cache in PGLite + Auto-Detect Modality]
    G --> H[Click Study → Auto-Populate Template]
    H --> I[AI Chat/Dictation Page]
    I --> J[Whisper → Text → RAG (RadLex FR/EN)]
    J --> K[Modality Agent Activated]
    K --> L[Generate Report → Editor (Lexical)]
    L --> M[Edit → Auto-Save Draft]
    M --> N[Finalize → Digital Sign → PDF]
    N --> O[C-STORE PDF to PACS + Print]
    O --> P[Status: Sent → Back to List]
```

---

## DEMO MVP: What to Show in 5 Minutes

1. **Splash → Finished Reports**  
   → Open PDF → Print  
2. **Worklist → Query PACS**  
   → Select IRM → Auto-opens report  
3. **Dictate: "Nodule pulmonaire droit"**  
   → AI: "Findings: Nodule pulmonaire droit de 8mm..."  
4. **Edit → Save → PDF with Stamp**  
5. **Send to PACS + Print**

---

## FINAL CHECKLIST: Don’t Ship Without These

| Item | Status |
|------|--------|
| PGLite + Vector + Auto-Migrate | Done |
| C-FIND + Cache | Done |
| Weasis URI | Done |
| Whisper (OpenAI) | Done |
| RAG RadLex FR/EN | Done |
| Modality Agent Auto-Detect | ADD |
| Report Template (Header/Footer) | Done |
| PDF + Digital Stamp | ADD |
| C-STORE PDF | ADD |
| Report Status + Versioning | ADD |
| Settings: Printer, Lang, Agent Prompt | ADD |
| Keyboard Shortcuts | ADD |


¦ 

### FULL TECHNICAL PLAN: Serenvale Radiology AI MVP  
**For Claude AI Vibecoding – Sequential, No Code, 100% Executable**

---

## **PHASE 0: Project Bootstrap (15 min)**

1. **Initialize Monorepo**  
   - `mkdir serenvale-mvp && cd serenvale-mvp && git init`  
   - `pnpm init` → set `"private": true`  
   - Create `pnpm-workspace.yaml`:  
     ```yaml
     packages:
       - 'apps/**'
       - 'packages/**'
       - '.'
     ```

2. **Folder Structure**  
   ```
   ├── apps/
   │   └── desktop/
   │       ├── src/
   │       │   ├── main/          # Electron main process
   │       │   └── preload/       # IPC bridge
   ├── packages/
   │   ├── database/          # Drizzle + PGLite
   │   └── model-runtime/     # OpenAI, RAG, Whisper
   ├── scripts/               # migrate.ts, seedRadLex.ts, buildElectron.ts
   ├── src/
   │   ├── app/
   │   │   ├── (main)/
   │   │   │   ├── reports/   # Finished reports list
   │   │   │   ├── worklist/  # PACS query
   │   │   │   └── report/[id]/ # AI dictation + editor
   │   │   └── settings/      # All configs
   │   ├── components/        # ReportEditor, VoiceInput, PDFViewer
   │   ├── hooks/             # useSTT, useTTS, useRAG, useAgent
   │   └── lib/               # config.ts, pacs.ts, i18n.ts, printer.ts
   ├── public/
   │   └── assets/            # logo, splash.mp4
   ├── drizzle.config.ts
   ├── next.config.ts
   ├── tsconfig.json
   ├── tailwind.config.ts
   ├── Dockerfile
   └── .env.local
   ```

3. **Gitignore**  
   - Add: `node_modules`, `.next`, `dist`, `.env*`, `data.db`, `drizzle`

---

## **PHASE 1: Core Dependencies & Configs (45 min)**

### 1.1 Install Dependencies
```bash
# Core
pnpm add next@16 react@19 react-dom@19
pnpm add @lobehub/ui@2.13.5 @lobehub/editor@1.21.2 @lobehub/tts@2.0.1
pnpm add drizzle-orm@0.44.7 @electric-sql/pglite@0.2.17 openai@4.104.0 zustand@5.0.4
pnpm add i18next@25.6.0 react-i18next@15.7.4

# PACS & DICOM
pnpm add dicom-dimse-client dcmjs @cornerstonejs/core

# RAG & AI
pnpm add @langchain/openai@0.3.57

# PDF & Print
pnpm add @react-pdf/renderer pdfkit pdf-lib

# Dev
pnpm add -D typescript@5.9.3 drizzle-kit@0.31.6 cross-env electron tsx tailwindcss electron-builder
```

### 1.2 `next.config.ts` (Leach LobeChat Perf)
- Enable `output: 'standalone'` when `NEXT_PUBLIC_IS_DESKTOP_APP=1`  
- `outputFileTracingIncludes`: `public/**/*`, `.next/static/**/*`  
- `experimental`: `serverMinification: false`, `webpackMemoryOptimizations: true`  
- `serverExternalPackages`: `['@electric-sql/pglite']`  
- Cache headers: `/icons/**` → `immutable`  
- `webpack.experiments`: `asyncWebAssembly: true`, `layers: true`  
- `transpilePackages`: `['@lobehub/ui']`

### 1.3 `drizzle.config.ts`
- `dialect: 'postgresql'`  
- `out: './drizzle'`  
- `schema: './packages/database/src/schema.ts'`  
- `strict: true`  
- Auto-load `.env` via `dotenv.config()`

### 1.4 `tailwind.config.ts`
- Use `lobePreset` from `@lobehub/ui`  
- `content`: `./src/**/*.{ts,tsx}`  
- Custom `primary` color

### 1.5 `tsconfig.json`
- `baseUrl: "."`  
- Paths: `@database/*`, `@model/*`  
- `strict: true`, `noUnusedLocals: true`

---

## **PHASE 2: Database Schema & PGLite (45 min)**

### 2.1 PGLite Init
- Dynamic path: `~/Serenvale/data.db` (desktop), `./data.db` (web)  
- Run `CREATE EXTENSION IF NOT EXISTS vector;`  
- Use `drizzle(pglite, { schema })`

### 2.2 Schema (`packages/database/src/schema.ts`)
| Table | Fields |
|------|--------|
| `studies` | `id (pk)`, `pacsId`, `metadata (jsonb)`, `modality`, `priority`, `fetchedAt` |
| `reports` | `id (pk)`, `studyId (fk)`, `version`, `parentId`, `content`, `status ('draft'|'final'|'signed'|'sent')`, `language`, `generatedAt`, `signedAt` |
| `rag` | `id (pk)`, `term`, `definition`, `modality`, `language`, `embedding (vector[1536])` |
| `templates` | `id (pk)`, `name`, `modality`, `header`, `footer`, `prompt`, `agentId` |
| `settings` | `key`, `value (jsonb)` |

### 2.3 Migrations & Seed
- `pnpm db:generate` after schema  
- `migrate.ts`: use `drizzle-orm/pglite/migrator`  
- `seedRadLex.ts`: fetch `https://radlex.org/data.csv` → embed per modality/lang → insert

### 2.4 Indexes
- `rag.embedding` → `ivfflat` with `vector_cosine_ops`  
- `reports.studyId`, `status`

---

## **PHASE 3: Settings System (30 min)**

### 3.1 Settings Page (`src/app/settings/page.tsx`)
- Tabs: **PACS**, **Clinic**, **Doctor**, **AI**, **Printer**, **Theme**

### 3.2 Settings Storage
- Use `settings` table (key-value)  
- Auto-load on app start  
- Reactive with Zustand

### 3.3 Settings Details
| Tab | Fields |
|-----|--------|
| **PACS** | IP, Port, AE Title, Default Query (Today/STAT), HL7 Auth |
| **Clinic** | Name, Address, NIF, Logo (upload), Letterhead HTML |
| **Doctor** | Name, Specialty, Signature (image/draw), Stamp |
| **AI** | OpenAI Key (encrypted), Default Agent per Modality, Prompt Template, Memory (tokens), Temperature |
| **Printer** | Network Printer Name, Default Paper Size |
| **Theme** | Logo, Dark/White, Accent Color |

---

## **PHASE 4: Splash & Finished Reports List (30 min)**

### 4.1 Splash Screen
- Show `public/assets/serenvale-splash.mp4` or logo animation  
- Fullscreen, auto-hide on load

### 4.2 Finished Reports (`src/app/(main)/reports/page.tsx`)
- TanStack Table  
- Columns: Patient, Modality, Date, Status (badge), Actions  
- Actions: **View PDF**, **Print**, **Send to PACS**, **Delete**, **Reopen**  
- Filter: Date, Modality, Status  
- Auto-refresh on DB change

---

## **PHASE 5: Worklist & PACS Integration (45 min)**

### 5.1 Worklist Page (`src/app/(main)/worklist/page.tsx`)
- Query Panel (persistent): Patient Name, Date Range, Modality, Priority  
- Save query on change, clear on app close  
- Button: **Query PACS**

### 5.2 C-FIND Logic
- Use `dicom-dimse-client`  
- Query `STUDY` level → return metadata only  
- Parse: `PatientName`, `StudyInstanceUID`, `Modality`, `StudyDate`, `Priority`  
- Cache in `studies` table (upsert on duplicate)

### 5.3 Study Row Actions
- **Open in Weasis**: generate `weasis://study?studyUID=...`  
- **Start Report**: navigate to `/report/[id]` → auto-fill template

---

## **PHASE 6: AI Report Generation Page (60 min)**

### 6.1 Layout (`src/app/report/[id]/page.tsx`)
- Split:  
  - **Left (40%)**: Chat + Dictation  
  - **Right (60%)**: `@lobehub/editor` (Lexical)

### 6.2 Agent System
- Auto-detect `modality` from study  
- Load agent from `templates` (prompt + RAG filter)  
- Fallback: default agent

### 6.3 Dictation
- **Hold-to-Record** button  
- Use OpenAI Whisper (`audio.transcriptions`)  
- On release → send to AI

### 6.4 AI Generation
- Input: dictation + RAG context (RadLex filtered by modality/lang)  
- Prompt: from template + user instruction  
- Output: **plain text only** → insert into editor  
- No hard-coded sections

### 6.5 Editor
- Auto-save draft every 5s  
- On save → create new version  
- **Finalize** → `status: 'final'`

---

## **PHASE 7: PDF Generation & Output (30 min)**

### 7.1 PDF Logic
- On **Finalize + Sign**:  
  1. Merge: Header (clinic) + Report + Footer (doctor stamp)  
  2. Add digital signature (image + timestamp)  
  3. Generate PDF via `@react-pdf/renderer`  
  4. Save to `reports.pdfBlob` or file

### 7.2 Output Actions
- **Print**: `webContents.print({ silent: true, deviceName })`  
- **Send to PACS**: `C-STORE` encapsulated PDF  
- **Download**: local file

---

## **PHASE 8: Electron & Desktop Integration (30 min)**

### 8.1 Main Process
- `apps/desktop/src/main/index.ts`  
- Create `BrowserWindow` with preload  
- Conditional load: dev → `localhost:3015`, prod → `file://`

### 8.2 IPC
- `launch-weasis`  
- `print-pdf`  
- `get-printers`

### 8.3 Build
- `scripts/buildElectron.ts` → `electron-builder`  
- Targets: `dmg`, `nsis`

---

## **PHASE 9: Docker & Scripts (15 min)**

### 9.1 Dockerfile
- Multi-stage: base → builder → runtime  
- `NODE_OPTIONS="--max-old-space-size=6144"`  
- Copy `.next/standalone`

### 9.2 Scripts
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "tsx scripts/migrate.ts",
"seed": "tsx scripts/seedRadLex.ts",
"dev:desktop": "cross-env NEXT_PUBLIC_IS_DESKTOP_APP=1 next dev -p 3015",
"build:electron": "cross-env NEXT_PUBLIC_IS_DESKTOP_APP=1 next build && tsx scripts/buildElectron.ts"
```

---

## **PHASE 10: Final Polish & Demo Flow (15 min)**

1. **Run**:  
   ```bash
   pnpm db:generate && pnpm db:migrate && pnpm seed
   pnpm dev:desktop
   ```

2. **Demo Flow**:  
   - Splash → Reports List  
   - Worklist → Query → Select IRM  
   - Dictate → AI Generate → Edit → Finalize → PDF + Print

---

## **CRITICAL NON-FUNCTIONAL**

| Feature | Implementation |
|--------|----------------|
| **Multi-Language** | i18next + `userSettings.defaultLang` → filter RAG + TTS voice |
| **Keyboard Shortcuts** | `Ctrl+S` = save, `Ctrl+P` = print, `F9` = dictate |
| **Offline-First** | All data in PGLite, PACS cache |
| **Encrypted Keys** | `electron-safe-storage` for OpenAI |
| **Versioning** | Auto-version on save |
| **Status Badges** | Draft (yellow), Final (blue), Signed (green) |


