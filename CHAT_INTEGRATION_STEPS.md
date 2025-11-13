# /chat Radiology Integration - Implementation Steps

This guide shows how to integrate the radiology workflow components into the existing `/chat` page.

---

## ✅ Components Created

1. **`useRadiologyContext.ts`** - Hook to detect radiology mode from URL
2. **`ReportEditorModal.tsx`** - Full-screen editor for final report editing
3. **`RadiologyBanner.tsx`** - Banner showing patient/study info in chat

---

## 📋 Integration Steps

### Step 1: Add Radiology Banner to Chat Page

**File**: Find the main chat page component (likely `src/app/[variants]/(main)/chat/page.tsx` or similar)

**Add to the top of the chat conversation area:**

```tsx
import { useRadiologyContext } from './hooks/useRadiologyContext';
import RadiologyBanner from './features/RadiologyBanner';

const ChatPage = () => {
  const { isRadiologyMode, studyMetadata, isEditing, reportId } = useRadiologyContext();

  return (
    <div>
      {/* Show banner when in radiology mode */}
      {isRadiologyMode && (
        <RadiologyBanner
          studyMetadata={studyMetadata}
          isEditing={isEditing}
          reportId={reportId}
        />
      )}

      {/* Rest of chat UI */}
      <ChatConversation />
      <ChatInput />
    </div>
  );
};
```

---

### Step 2: Auto-load Modality-Specific Agent

**When entering radiology mode, automatically load the appropriate agent:**

```tsx
import { useEffect } from 'react';

const ChatPage = () => {
  const { isRadiologyMode, studyMetadata } = useRadiologyContext();

  useEffect(() => {
    if (isRadiologyMode && studyMetadata) {
      // Map modality to agent
      const agentMapping = {
        CT: 'agent_ct_radiology',
        MR: 'agent_mr_radiology',
        CR: 'agent_cr_radiology',
        DX: 'agent_dx_radiology',
        US: 'agent_us_radiology',
      };

      const agentId = agentMapping[studyMetadata.modality] || 'agent_default_radiology';

      // Use LobeChat's agent switching mechanism
      // (implementation depends on LobeChat's agent store)
      // Example: switchAgent(agentId);
    }
  }, [isRadiologyMode, studyMetadata]);
};
```

---

### Step 3: Add System Message with Study Context

**Inject study information as the first message:**

```tsx
useEffect(() => {
  if (isRadiologyMode && !isEditing && studyMetadata) {
    const systemPrompt = `
I am helping you create a radiology report for:

**Patient**: ${studyMetadata.patientName} (ID: ${studyMetadata.patientId})
**Study**: ${studyMetadata.modality} - ${studyMetadata.studyDescription}
**Date**: ${studyMetadata.studyDate}
**Accession**: ${studyMetadata.accessionNumber}

Please dictate your findings and I will help structure them into a proper radiology report based on your template.
`;

    // Add as system message
    // (use LobeChat's message creation API)
    // Example: createSystemMessage(systemPrompt);
  }
}, [isRadiologyMode, isEditing, studyMetadata]);
```

---

### Step 4: Save AI Response as Topic (Report Draft)

**When AI generates a complete report, save it as a topic:**

```tsx
// In your message handling logic, detect when AI generates a full report
const handleAIMessage = async (message: Message) => {
  if (isRadiologyMode && isCompleteReport(message.content)) {
    // Save as topic with special metadata
    const topicData = {
      title: `${studyMetadata.patientName} - ${studyMetadata.modality} Report`,
      content: message.content,
      metadata: {
        type: 'radiology-report',
        status: 'pending',
        studyId: studyId,
        patientInfo: studyMetadata,
        reportContent: message.content,
      },
    };

    // Use LobeChat's topic creation API
    // Example: await createTopic(topicData);

    // Show notification
    message.info('Report draft saved! Click it in Topics (→) to edit.');
  }
};

// Helper to detect if message is a complete report
const isCompleteReport = (content: string) => {
  // Simple heuristic: check if it has typical report sections
  const hasSections =
    content.includes('FINDINGS') ||
    content.includes('IMPRESSION') ||
    content.includes('CLINICAL INDICATION');

  return hasSections && content.length > 200;
};
```

---

### Step 5: Integrate Report Editor Modal

**Add the modal to your chat page and control its visibility:**

```tsx
import { useState } from 'react';
import ReportEditorModal from './features/ReportEditorModal';

const ChatPage = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  // Open editor when topic is clicked
  const handleTopicClick = (topic) => {
    if (topic.metadata?.type === 'radiology-report') {
      setCurrentReport({
        patientInfo: topic.metadata.patientInfo,
        aiContent: topic.metadata.reportContent,
        status: topic.metadata.status,
        reportId: topic.id,
        // TODO: Load clinic and doctor info from settings
        clinicInfo: {
          name: 'Serenvale Radiology Center',
          address: '123 Medical Drive',
        },
        doctorInfo: {
          name: 'Dr. Smith',
          signature: 'signature.png',
        },
      });
      setEditorVisible(true);
    }
  };

  return (
    <div>
      {/* Chat UI */}
      <ChatConversation onTopicClick={handleTopicClick} />

      {/* Report Editor Modal */}
      {currentReport && (
        <ReportEditorModal
          visible={editorVisible}
          onClose={() => setEditorVisible(false)}
          report={currentReport}
          onSave={(content) => {
            // TODO: Save to database
            console.log('Saving report:', content);
          }}
          onFinalize={(content) => {
            // TODO: Update status to 'final' in database
            console.log('Finalizing report:', content);
          }}
          onPrint={(content) => {
            // TODO: Implement print
            console.log('Printing report:', content);
          }}
          onSend={(content) => {
            // TODO: C-STORE to PACS
            console.log('Sending to PACS:', content);
          }}
        />
      )}
    </div>
  );
};
```

---

### Step 6: Modify Topic List to Show Report Status

**Customize topic display for radiology reports:**

```tsx
// In LobeChat's topic list component, add special rendering for radiology topics
const TopicListItem = ({ topic }) => {
  const isRadiologyReport = topic.metadata?.type === 'radiology-report';

  if (isRadiologyReport) {
    return (
      <div className="topic-item">
        {/* Status indicator */}
        <Badge
          color={topic.metadata.status === 'pending' ? 'orange' : 'blue'}
          dot
        />

        {/* Topic title */}
        <span>{topic.title}</span>

        {/* Status tag */}
        <Tag size="small">
          {topic.metadata.status === 'pending' ? 'PENDING REVIEW' : 'DRAFT'}
        </Tag>
      </div>
    );
  }

  // Normal topic rendering
  return <NormalTopicItem topic={topic} />;
};
```

---

## 🔧 Database Operations Needed

### Save Report Draft:
```typescript
const saveReportDraft = async (reportData) => {
  await db.reports.create({
    studyId: reportData.studyId,
    content: reportData.content,
    status: 'draft',
    version: 1,
    language: 'en', // or 'fr' based on settings
    userId: currentUser.id,
  });
};
```

### Load Report for Editing:
```typescript
const loadReport = async (reportId: string) => {
  const report = await db.reports.findById(reportId);
  return {
    aiContent: report.content,
    status: report.status,
    // ... other fields
  };
};
```

### Update Report:
```typescript
const updateReport = async (reportId: string, content: string) => {
  await db.reports.update({
    where: { id: reportId },
    data: {
      content,
      updatedAt: new Date(),
    },
  });
};
```

---

## 🎨 UI States

### State 1: Doctor Opens Chat from Worklist
```
URL: /chat?mode=radiology-report&studyId=std_001&patientName=John...
Shows: RadiologyBanner + empty chat + system message about patient
```

### State 2: Doctor Dictates/Types
```
[User]: "Nodule in right upper lobe, 8mm"
[AI]: "I'll structure that into your report..."
```

### State 3: AI Generates Complete Report
```
[AI]: *Shows formatted report*
→ Auto-saves as topic with 🟠 orange dot
→ Notification: "Report saved! Click to edit"
```

### State 4: Doctor Clicks Topic
```
→ Opens ReportEditorModal (full screen)
→ Shows assembled report with header/footer
→ Doctor makes final edits
→ Actions: Save Draft / Finalize / Print / Send
```

---

## 📝 Template System (From Settings)

**Load template when generating report:**

```typescript
// Load modality-specific template from settings
const getReportTemplate = (modality: string) => {
  // TODO: Fetch from database settings table
  const templates = {
    CT: {
      prompt: `
Generate a CT radiology report with these sections:
1. CLINICAL INDICATION
2. TECHNIQUE
3. FINDINGS (detailed observations)
4. IMPRESSION (summary and conclusions)

Use clear medical terminology and RadLex terms.
`,
    },
    MR: {
      prompt: `
Generate an MR radiology report with these sections:
1. CLINICAL INDICATION
2. TECHNIQUE (sequences used)
3. FINDINGS (detailed observations)
4. IMPRESSION (summary and conclusions)

Use clear medical terminology and RadLex terms.
`,
    },
  };

  return templates[modality] || templates.CT;
};

// Use in AI system prompt
const systemPrompt = `
${getReportTemplate(studyMetadata.modality).prompt}

Patient: ${studyMetadata.patientName}
Study: ${studyMetadata.studyDescription}
`;
```

---

## 🚀 Next Steps After Integration

1. **Test the workflow**:
   - Go to /worklist → Click "Report"
   - Verify banner shows patient info
   - Dictate findings
   - Check AI response
   - Verify topic saved with orange dot
   - Click topic → verify editor opens

2. **Connect to database**:
   - Implement save/load/update functions
   - Store reports in `reports` table

3. **Load clinic/doctor settings**:
   - Fetch from settings tables
   - Inject into report header/footer

4. **Implement PDF generation**:
   - Use report content from editor
   - Add clinic header/footer
   - Add digital signature

5. **Add DICOM C-STORE**:
   - Convert PDF to DICOM encapsulated PDF
   - Send via C-STORE to PACS

---

## 📂 Files Modified

- ✅ Created: `chat/hooks/useRadiologyContext.ts`
- ✅ Created: `chat/features/ReportEditorModal.tsx`
- ✅ Created: `chat/features/RadiologyBanner.tsx`
- 🔧 Modify: `chat/page.tsx` (add banner and editor)
- 🔧 Modify: Topic list component (show report status)
- 🔧 Modify: Message handler (save reports as topics)

---

## 💡 Tips

- Use LobeChat's existing agent switching mechanism
- Leverage topic metadata for storing report-specific data
- Keep chat input normal - no special dictation mode needed
- Editor is triggered by topic click, not automatic
- All report assembly happens in the modal, not in chat

Ready to integrate! 🚀
