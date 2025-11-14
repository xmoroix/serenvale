'use client';

import { Button } from 'antd';
import { FileEdit } from 'lucide-react';

import { useRadiologyContext } from '../hooks/useRadiologyContext';
import { useReportEditorStore } from '@/store/report';
import { useChatStore } from '@/store/chat';

/**
 * Button to open the report editor with the current AI-generated content
 * Only shows in radiology mode when there are messages
 */
const OpenReportEditorButton = () => {
  const { isRadiologyMode, studyMetadata, studyId } = useRadiologyContext();
  const openEditor = useReportEditorStore((s) => s.openEditor);

  // Get the last assistant message content
  const messages = useChatStore((s) => s.messages);
  const lastAssistantMessage = [...(messages || [])]
    .reverse()
    .find((msg) => msg.role === 'assistant');

  if (!isRadiologyMode || !studyMetadata || !lastAssistantMessage) {
    return null;
  }

  const handleOpenEditor = () => {
    openEditor({
      aiContent: lastAssistantMessage.content,
      patientInfo: {
        id: studyMetadata.patientId,
        name: studyMetadata.patientName,
        date: studyMetadata.studyDate,
        modality: studyMetadata.modality,
        studyDescription: studyMetadata.studyDescription,
        accessionNumber: studyMetadata.accessionNumber,
      },
      studyId: studyId,
      status: 'draft',
    });
  };

  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <Button
        icon={<FileEdit size={16} />}
        onClick={handleOpenEditor}
        size="large"
        type="primary"
      >
        Open in Report Editor
      </Button>
    </div>
  );
};

export default OpenReportEditorButton;
