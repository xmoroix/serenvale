'use client';

import { App, Button, Modal, Space, Tag } from 'antd';
import { FileText, Printer, Send, Save } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { lambdaQuery } from '@/libs/trpc/client';

interface ReportData {
  aiContent: string;
  clinicInfo?: {
    address?: string;
    logo?: string;
    name?: string;
  };
  doctorInfo?: {
    name?: string;
    signature?: string;
    stamp?: string;
  };
  patientInfo: {
    accessionNumber?: string;
    date: string;
    id: string;
    modality: string;
    name: string;
    studyDescription?: string;
  };
  reportId?: string;
  studyId?: string;
  status?: 'draft' | 'final' | 'signed' | 'sent';
}

interface ReportEditorModalProps {
  onClose: () => void;
  onFinalize?: (content: string) => void;
  onPrint?: (content: string) => void;
  onSave?: (content: string) => void;
  onSend?: (content: string) => void;
  report: ReportData;
  visible: boolean;
}

const ReportEditorModal = ({
  visible,
  onClose,
  report,
  onSave,
  onFinalize,
  onPrint,
  onSend,
}: ReportEditorModalProps) => {
  const { message } = App.useApp();

  // Assemble the full report from all components
  const assembleReport = () => {
    const parts = [];

    // Header - Clinic Info
    if (report.clinicInfo?.name) {
      parts.push(`${report.clinicInfo.name}`);
      if (report.clinicInfo.address) {
        parts.push(report.clinicInfo.address);
      }
      parts.push('');
    }

    // Report Title
    parts.push('RADIOLOGY REPORT');
    parts.push('─'.repeat(50));
    parts.push('');

    // Patient Information
    parts.push(`Patient: ${report.patientInfo.name} (ID: ${report.patientInfo.id})`);
    parts.push(`Study Date: ${report.patientInfo.date}`);
    parts.push(`Modality: ${report.patientInfo.modality}`);
    if (report.patientInfo.studyDescription) {
      parts.push(`Study: ${report.patientInfo.studyDescription}`);
    }
    if (report.patientInfo.accessionNumber) {
      parts.push(`Accession #: ${report.patientInfo.accessionNumber}`);
    }
    parts.push('');
    parts.push('─'.repeat(50));
    parts.push('');

    // AI-Generated Report Content
    parts.push(report.aiContent);
    parts.push('');

    // Footer - Doctor Info
    parts.push('─'.repeat(50));
    parts.push('');
    if (report.doctorInfo?.name) {
      parts.push(`Electronically signed by: ${report.doctorInfo.name}`);
      if (report.doctorInfo.signature) {
        parts.push(`[Signature: ${report.doctorInfo.signature}]`);
      }
      if (report.doctorInfo.stamp) {
        parts.push(`[Stamp: ${report.doctorInfo.stamp}]`);
      }
    }

    return parts.join('\n');
  };

  const [content, setContent] = useState(assembleReport());
  const [currentReportId, setCurrentReportId] = useState(report.reportId);
  const [isSaving, setIsSaving] = useState(false);

  const createReportMutation = lambdaQuery.report.createReport.useMutation();
  const updateReportMutation = lambdaQuery.report.updateReport.useMutation();
  const signReportMutation = lambdaQuery.report.signReport.useMutation();

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (onSave) {
        onSave(content);
        message.success('Report saved as draft');
      } else {
        // Create or update the report
        if (currentReportId) {
          // Update existing report
          await updateReportMutation.mutateAsync({
            id: currentReportId,
            value: {
              content,
              status: 'draft',
            },
          });
          message.success('Report updated as draft');
        } else {
          // Create new report
          const reportId = await createReportMutation.mutateAsync({
            studyId: report.studyId || null,
            content,
            status: 'draft',
            metadata: {
              patientName: report.patientInfo.name,
              patientId: report.patientInfo.id,
              modality: report.patientInfo.modality,
              studyDate: report.patientInfo.date,
              studyDescription: report.patientInfo.studyDescription,
              accessionNumber: report.patientInfo.accessionNumber,
            },
          });
          setCurrentReportId(reportId);
          message.success('Report saved as draft');
        }
      }
    } catch (error) {
      console.error('Failed to save report:', error);
      message.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsSaving(true);

      if (onFinalize) {
        onFinalize(content);
        message.success('Report finalized');
        onClose();
      } else {
        // Create or update the report with final status
        if (currentReportId) {
          await updateReportMutation.mutateAsync({
            id: currentReportId,
            value: {
              content,
              status: 'final',
            },
          });
          message.success('Report finalized');
        } else {
          const reportId = await createReportMutation.mutateAsync({
            studyId: report.studyId || null,
            content,
            status: 'final',
            metadata: {
              patientName: report.patientInfo.name,
              patientId: report.patientInfo.id,
              modality: report.patientInfo.modality,
              studyDate: report.patientInfo.date,
              studyDescription: report.patientInfo.studyDescription,
              accessionNumber: report.patientInfo.accessionNumber,
            },
          });
          setCurrentReportId(reportId);
          message.success('Report finalized');
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to finalize report:', error);
      message.error('Failed to finalize report');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(content);
    } else {
      // TODO: Implement print
      message.info('Print functionality (implementation pending)');
    }
  };

  const handleSend = () => {
    if (report.status !== 'signed' && report.status !== 'final') {
      message.warning('Report must be finalized and signed before sending to PACS');
      return;
    }

    if (onSend) {
      onSend(content);
      message.success('Report sent to PACS');
    } else {
      message.info('Send to PACS (implementation pending)');
    }
  };

  return (
    <Modal
      footer={[
        <Space key="actions">
          <Button
            disabled={isSaving}
            icon={<Save size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save Draft
          </Button>
          <Button
            disabled={isSaving}
            icon={<FileText size={16} />}
            loading={isSaving}
            onClick={handleFinalize}
            type="primary"
          >
            Finalize
          </Button>
          <Button disabled={isSaving} icon={<Printer size={16} />} onClick={handlePrint}>
            Print
          </Button>
          <Button
            disabled={isSaving || (report.status !== 'signed' && report.status !== 'final')}
            icon={<Send size={16} />}
            onClick={handleSend}
          >
            Send to PACS
          </Button>
        </Space>,
      ]}
      onCancel={onClose}
      open={visible}
      style={{ top: 20 }}
      title={
        <Flexbox gap={8} horizontal>
          <span>Radiology Report Editor</span>
          {report.status && (
            <Tag
              color={
                report.status === 'draft'
                  ? 'orange'
                  : report.status === 'final'
                    ? 'blue'
                    : report.status === 'signed'
                      ? 'green'
                      : 'purple'
              }
            >
              {report.status.toUpperCase()}
            </Tag>
          )}
        </Flexbox>
      }
      width="90vw"
    >
      <Flexbox style={{ height: 'calc(90vh - 200px)' }}>
        {/* TODO: Replace with @lobehub/editor when integrated */}
        <textarea
          onChange={(e) => setContent(e.target.value)}
          placeholder="Review and edit the report..."
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 14,
            height: '100%',
            lineHeight: 1.6,
            padding: 16,
            resize: 'none',
            width: '100%',
          }}
          value={content}
        />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>
          Note: Full rich text editor (@lobehub/editor) will be integrated here
        </div>
      </Flexbox>
    </Modal>
  );
};

export default ReportEditorModal;
