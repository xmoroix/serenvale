'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Badge, Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileText, Printer, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

interface Report {
  accessionNumber?: string;
  date: string;
  id: string;
  modality: string;
  patientId: string;
  patientName: string;
  priority?: 'STAT' | 'URGENT' | 'ROUTINE';
  status: 'draft' | 'final' | 'signed' | 'sent';
  studyDescription?: string;
}

// Mock data for demonstration - same structure as worklist
const mockReports: Report[] = [
  {
    id: 'rpt_001',
    patientName: 'John Doe',
    patientId: 'P123456',
    date: '2024-11-13',
    modality: 'CT',
    studyDescription: 'CT Chest without contrast',
    priority: 'STAT',
    status: 'signed',
    accessionNumber: 'ACC001',
  },
  {
    id: 'rpt_002',
    patientName: 'Jane Smith',
    patientId: 'P789012',
    date: '2024-11-13',
    modality: 'MR',
    studyDescription: 'MR Brain',
    priority: 'ROUTINE',
    status: 'draft',
    accessionNumber: 'ACC002',
  },
  {
    id: 'rpt_003',
    patientName: 'Bob Johnson',
    patientId: 'P345678',
    date: '2024-11-12',
    modality: 'CR',
    studyDescription: 'Chest X-ray',
    priority: 'ROUTINE',
    status: 'sent',
    accessionNumber: 'ACC003',
  },
];

const ReportsTable = () => {
  const router = useRouter();
  const { message } = App.useApp();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'yellow';
      case 'final':
        return 'blue';
      case 'signed':
        return 'green';
      case 'sent':
        return 'purple';
      default:
        return 'default';
    }
  };

  const handleEdit = (report: Report) => {
    // Navigate to /chat with existing report for editing
    const params = new URLSearchParams({
      reportId: report.id,
      patientName: report.patientName,
      patientId: report.patientId,
      modality: report.modality,
      studyDate: report.date,
      studyDescription: report.studyDescription || '',
      accessionNumber: report.accessionNumber || '',
      mode: 'radiology-report',
      edit: 'true',
    });
    router.push(`/chat?${params.toString()}`);
  };

  const handlePrint = (report: Report) => {
    // TODO: Open print dialog or send to printer
    message.info(`Printing report for ${report.patientName} (implementation pending)`);
  };

  const handleSend = (report: Report) => {
    // TODO: C-STORE PDF to PACS
    if (report.status !== 'signed') {
      message.warning('Only signed reports can be sent to PACS');
      return;
    }
    message.info(`Sending to PACS for ${report.patientName} (implementation pending)`);
  };

  const columns: ColumnsType<Report> = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        if (!priority) return null;
        const color = priority === 'STAT' ? 'red' : priority === 'URGENT' ? 'orange' : 'blue';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 200,
    },
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Modality',
      dataIndex: 'modality',
      key: 'modality',
      width: 100,
      render: (modality: string) => <Badge color="blue" text={modality} />,
    },
    {
      title: 'Study Description',
      dataIndex: 'studyDescription',
      key: 'studyDescription',
      ellipsis: true,
    },
    {
      title: 'Accession #',
      dataIndex: 'accessionNumber',
      key: 'accessionNumber',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_, report) => (
        <Flexbox gap={8} horizontal>
          <Button
            icon={<FileText size={14} />}
            onClick={() => handleEdit(report)}
            size="small"
            type="primary"
          >
            Edit
          </Button>
          <Button icon={<Printer size={14} />} onClick={() => handlePrint(report)} size="small">
            Print
          </Button>
          <Button
            disabled={report.status !== 'signed'}
            icon={<Send size={14} />}
            onClick={() => handleSend(report)}
            size="small"
          >
            Send
          </Button>
        </Flexbox>
      ),
    },
  ];

  return (
    <Block paddingBlock={16} paddingInline={24} style={{ borderRadius: 12 }} variant={'outlined'}>
      <Flexbox gap={16}>
        <Flexbox horizontal justify={'space-between'}>
          <Flexbox>
            <Text as={'h3'}>Finished Reports</Text>
            <Text type={'secondary'}>{reports.length} reports</Text>
          </Flexbox>
        </Flexbox>

        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowKey="id"
          scroll={{ x: 1000 }}
          size="small"
        />
      </Flexbox>
    </Block>
  );
};

export default ReportsTable;
