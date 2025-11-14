'use client';

import { App, Button, Modal, Space, Tag } from 'antd';
import { FileText, Printer, Send, Save, Check } from 'lucide-react';
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

  const handleSign = async () => {
    try {
      setIsSaving(true);

      if (!currentReportId) {
        message.error('Please save the report before signing');
        return;
      }

      // Must be finalized before signing
      if (report.status === 'draft') {
        message.warning('Please finalize the report before signing');
        return;
      }

      await signReportMutation.mutateAsync({ id: currentReportId });
      message.success('Report signed successfully');
      // Update local status
      report.status = 'signed';
      onClose();
    } catch (error) {
      console.error('Failed to sign report:', error);
      message.error('Failed to sign report');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(content);
    } else {
      // Generate print preview
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Radiology Report - ${report.patientInfo.name}</title>
              <style>
                body {
                  font-family: 'Times New Roman', serif;
                  margin: 2cm;
                  line-height: 1.6;
                }
                h1 {
                  text-align: center;
                  font-size: 18pt;
                  margin-bottom: 20px;
                }
                .header {
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 20px;
                }
                .patient-info {
                  margin-bottom: 20px;
                }
                .content {
                  white-space: pre-wrap;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 40px;
                  border-top: 1px solid #000;
                  padding-top: 10px;
                }
                @media print {
                  body { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>RADIOLOGY REPORT</h1>
              </div>
              <div class="patient-info">
                <p><strong>Patient:</strong> ${report.patientInfo.name} (ID: ${report.patientInfo.id})</p>
                <p><strong>Study Date:</strong> ${report.patientInfo.date}</p>
                <p><strong>Modality:</strong> ${report.patientInfo.modality}</p>
                ${report.patientInfo.studyDescription ? `<p><strong>Study:</strong> ${report.patientInfo.studyDescription}</p>` : ''}
                ${report.patientInfo.accessionNumber ? `<p><strong>Accession #:</strong> ${report.patientInfo.accessionNumber}</p>` : ''}
              </div>
              <div class="content">${content.replace(/\n/g, '<br>')}</div>
              <div class="footer">
                <p><strong>Status:</strong> ${report.status?.toUpperCase() || 'DRAFT'}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        message.error('Could not open print window. Please check your popup blocker.');
      }
    }
  };

  const handleSend = async () => {
    if (report.status !== 'signed' && report.status !== 'final') {
      message.warning('Report must be finalized and signed before sending to PACS');
      return;
    }

    if (onSend) {
      onSend(content);
      message.success('Report sent to PACS');
    } else {
      // TODO: Implement C-STORE to PACS
      try {
        setIsSaving(true);

        if (!currentReportId) {
          message.error('Please save the report before sending to PACS');
          return;
        }

        // For now, just show a message
        // In production, this would:
        // 1. Generate PDF of the report
        // 2. Use C-STORE to send PDF as DICOM SR to PACS
        // 3. Update report status to 'sent'
        message.info('Send to PACS (C-STORE implementation pending)');

        // When implemented, call:
        // await lambdaQuery.report.markReportAsSent.mutateAsync({ id: currentReportId });
      } catch (error) {
        console.error('Failed to send to PACS:', error);
        message.error('Failed to send report to PACS');
      } finally {
        setIsSaving(false);
      }
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
          <Button
            disabled={isSaving || report.status === 'draft' || report.status === 'signed'}
            icon={<Check size={16} />}
            loading={isSaving}
            onClick={handleSign}
            type={report.status === 'signed' ? 'default' : 'primary'}
          >
            {report.status === 'signed' ? 'Signed' : 'Sign Report'}
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
