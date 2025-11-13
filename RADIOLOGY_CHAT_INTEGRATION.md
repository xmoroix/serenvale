# Radiology Report Integration with /chat

## Overview

The radiology workflow is now wired to use the existing `/chat` interface for report generation and editing. This document explains what's been done and what needs to be customized.

---

## ✅ What's Already Working

### 1. Navigation Flow
- **Worklist → Chat**: Click "Report" button → Redirects to `/chat` with study metadata
- **Reports → Chat**: Click "Edit" button → Redirects to `/chat` with report ID

### 2. URL Parameters Passed

#### From Worklist (New Report):
```
/chat?studyId=std_001
     &patientName=John+Doe
     &patientId=P123456
     &modality=CT
     &studyDate=2024-11-13
     &studyDescription=CT+Chest
     &accessionNumber=ACC001
     &mode=radiology-report
```

#### From Reports (Edit Existing):
```
/chat?reportId=rpt_001
     &patientName=Jane+Smith
     &patientId=P789012
     &modality=MR
     &studyDate=2024-11-13
     &mode=radiology-report
     &edit=true
```

### 3. LobeChat Features Available
- ✅ Voice input (perfect for dictation)
- ✅ AI conversation with streaming
- ✅ `@lobehub/editor` (Lexical) for rich text editing
- ✅ Agent system (can load modality-specific agents)
- ✅ File attachments (can attach DICOM screenshots)
- ✅ Multi-language support (FR/EN)
- ✅ Markdown rendering

---

## 🚧 What Needs to Be Customized

### 1. Detect Radiology Mode

Create a hook to detect radiology context:

**File**: `src/app/[variants]/(main)/chat/hooks/useRadiologyContext.ts`

```typescript
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface RadiologyContext {
  isRadiologyMode: boolean;
  studyId?: string;
  reportId?: string;
  isEditing: boolean;
  studyMetadata?: {
    patientName: string;
    patientId: string;
    modality: string;
    studyDate: string;
    studyDescription: string;
    accessionNumber: string;
  };
}

export const useRadiologyContext = (): RadiologyContext => {
  const searchParams = useSearchParams();

  const isRadiologyMode = searchParams.get('mode') === 'radiology-report';
  const isEditing = searchParams.get('edit') === 'true';
  const studyId = searchParams.get('studyId') || undefined;
  const reportId = searchParams.get('reportId') || undefined;

  const studyMetadata = useMemo(() => {
    if (!isRadiologyMode) return undefined;

    return {
      patientName: searchParams.get('patientName') || '',
      patientId: searchParams.get('patientId') || '',
      modality: searchParams.get('modality') || '',
      studyDate: searchParams.get('studyDate') || '',
      studyDescription: searchParams.get('studyDescription') || '',
      accessionNumber: searchParams.get('accessionNumber') || '',
    };
  }, [searchParams, isRadiologyMode]);

  return {
    isRadiologyMode,
    studyId,
    reportId,
    isEditing,
    studyMetadata,
  };
};
```

---

### 2. Auto-Load Modality-Specific Agent

When in radiology mode, automatically select the appropriate agent:

**Location**: Modify `/chat` initialization logic

```typescript
// In chat page or layout component
const { isRadiologyMode, studyMetadata } = useRadiologyContext();

useEffect(() => {
  if (isRadiologyMode && studyMetadata) {
    // Map modality to agent ID
    const agentMap = {
      'CT': 'agent_ct_radiology',
      'MR': 'agent_mr_radiology',
      'CR': 'agent_cr_radiology',
      'DX': 'agent_dx_radiology',
      'US': 'agent_us_radiology',
    };

    const agentId = agentMap[studyMetadata.modality] || 'agent_default_radiology';

    // Load agent (use LobeChat's agent switching mechanism)
    // This will vary based on LobeChat's implementation
  }
}, [isRadiologyMode, studyMetadata]);
```

---

### 3. Pre-populate Report Header

Add a system message with study context when starting a new report:

```typescript
// In chat initialization
useEffect(() => {
  if (isRadiologyMode && studyId && !isEditing) {
    const systemMessage = `
# Radiology Report

**Patient**: ${studyMetadata.patientName} (ID: ${studyMetadata.patientId})
**Study Date**: ${studyMetadata.studyDate}
**Modality**: ${studyMetadata.modality}
**Study Description**: ${studyMetadata.studyDescription}
**Accession Number**: ${studyMetadata.accessionNumber}

---

Please dictate your findings and I will help you generate a structured radiology report.
`;

    // Add as first message (use LobeChat's message creation API)
    // createMessage({ role: 'system', content: systemMessage });
  }
}, [isRadiologyMode, studyId, isEditing, studyMetadata]);
```

---

### 4. Load Existing Report for Editing

When editing an existing report, fetch and display it:

```typescript
useEffect(() => {
  if (isRadiologyMode && reportId && isEditing) {
    // Fetch report from database
    const loadReport = async () => {
      // TODO: Implement database fetch
      // const report = await fetchReport(reportId);
      // Load report content into editor
    };

    loadReport();
  }
}, [isRadiologyMode, reportId, isEditing]);
```

---

### 5. Customize Agent Prompts

Create radiology-specific system prompts for each modality:

**Example CT Agent Prompt**:
```
You are a radiology AI assistant specialized in CT (Computed Tomography) imaging.

Your role:
- Listen to the radiologist's dictation
- Help structure findings using RadLex terminology
- Suggest differential diagnoses when appropriate
- Format reports according to standard radiology templates

Report Structure:
1. Clinical Indication
2. Technique
3. Findings
4. Impression

Always use clear, concise medical language. Ask for clarification if needed.
```

Store these in the database as agent configurations.

---

### 6. Add Report Actions to Chat UI

Add custom actions to the chat interface when in radiology mode:

**Suggested UI additions**:
- **Save Draft** button (save to `reports` table with status='draft')
- **Finalize Report** button (status='final')
- **Sign Report** button (add signature, status='signed')
- **Export PDF** button (generate PDF with clinic header/footer)

**Example implementation location**:
`src/app/[variants]/(main)/chat/features/ChatInput` or custom toolbar

---

### 7. Report Template System

Create report templates in the database:

```sql
-- Already defined in schema, now create templates
INSERT INTO templates (name, modality, header, footer, prompt) VALUES
(
  'CT Chest Standard',
  'CT',
  'CHEST CT WITHOUT CONTRAST',
  'Electronically signed by Dr. {{doctorName}}',
  'Generate a structured CT chest report...'
);
```

Load appropriate template based on modality when starting a new report.

---

## 📝 Recommended Next Steps

### Step 1: Implement Detection (Easy - 30 min)
1. Create `useRadiologyContext` hook
2. Test URL parameter detection
3. Log context to console to verify

### Step 2: Add Visual Indicator (Easy - 15 min)
1. Show a banner in `/chat` when in radiology mode
2. Display patient info header
3. Show "Radiology Report Mode" badge

### Step 3: Agent Auto-Selection (Medium - 1 hour)
1. Create modality-specific agents in database
2. Implement auto-load logic
3. Test with different modalities

### Step 4: Report Persistence (Medium - 2 hours)
1. Add "Save Draft" button
2. Implement database save/update
3. Load existing reports for editing

### Step 5: PDF Generation (Complex - 4 hours)
1. Create PDF template with clinic header
2. Implement signature embedding
3. Add print functionality

---

## 🎯 Testing the Workflow

### Test New Report:
1. Go to `/worklist`
2. Click "Report" on a study
3. Verify redirect to `/chat` with parameters
4. Check console for radiology context detection
5. Dictate findings using voice input
6. Save as draft

### Test Edit Report:
1. Go to `/reports`
2. Click "Edit" on a draft report
3. Verify redirect to `/chat` with edit mode
4. Verify report content loads
5. Make changes
6. Update report

---

## 🔧 Integration Points

### Database Queries Needed:
- Fetch study by ID: `SELECT * FROM studies WHERE id = $1`
- Fetch report by ID: `SELECT * FROM reports WHERE id = $1`
- Create report: `INSERT INTO reports (...) VALUES (...)`
- Update report: `UPDATE reports SET content = $1 WHERE id = $2`

### LobeChat Features to Leverage:
- Message streaming for AI responses
- Voice input for dictation (already built-in)
- File upload for DICOM screenshots
- Agent switching for modality-specific prompts
- Editor for rich text formatting

---

## 📚 Reference

- LobeChat Editor: `@lobehub/editor` package
- Agent System: `src/store/agent/`
- Message System: `src/store/chat/`
- Voice Input: Already integrated in chat input

All the building blocks are there - just need to wire them together for the radiology workflow!
