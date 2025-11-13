'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Badge, Button, Dropdown, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { FileText, MoreVertical, Printer, Send, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

interface Report {
  createdAt: string;
  id: string;
  modality: string;
  patientName: string;
  status: 'draft' | 'final' | 'signed' | 'sent';
  studyDate: string;
}

// Mock data for demonstration
const mockReports: Report[] = [
  {
    id: 'rpt_001',
    patientName: 'John Doe',
    studyDate: '2024-11-13',
    modality: 'CT',
    status: 'signed',
    createdAt: '2024-11-13 14:30',
  },
  {
    id: 'rpt_002',
    patientName: 'Jane Smith',
    studyDate: '2024-11-13',
    modality: 'MR',
    status: 'draft',
    createdAt: '2024-11-13 15:45',
  },
  {
    id: 'rpt_003',
    patientName: 'Bob Johnson',
    studyDate: '2024-11-12',
    modality: 'CR',
    status: 'sent',
    createdAt: '2024-11-12 16:20',
  },
];

const ReportsTable = () => {
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

  const handleViewPDF = (report: Report) => {
    message.info(`Opening PDF for ${report.patientName} (implementation pending)`);
  };

  const handlePrint = (report: Report) => {
    message.info(`Printing report for ${report.patientName} (implementation pending)`);
  };

  const handleSendToPACS = (report: Report) => {
    message.info(`Sending to PACS for ${report.patientName} (implementation pending)`);
  };

  const handleDelete = (report: Report) => {
    message.warning(`Delete report for ${report.patientName}? (implementation pending)`);
  };

  const handleReopen = (report: Report) => {
    message.info(`Reopening report for editing (implementation pending)`);
  };

  const getActionItems = (report: Report): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View PDF',
      icon: <Eye size={14} />,
      onClick: () => handleViewPDF(report),
    },
    {
      key: 'print',
      label: 'Print',
      icon: <Printer size={14} />,
      onClick: () => handlePrint(report),
    },
    {
      key: 'send',
      label: 'Send to PACS',
      icon: <Send size={14} />,
      onClick: () => handleSendToPACS(report),
      disabled: report.status !== 'signed',
    },
    {
      type: 'divider',
    },
    {
      key: 'reopen',
      label: 'Reopen',
      icon: <FileText size={14} />,
      onClick: () => handleReopen(report),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => handleDelete(report),
    },
  ];

  const columns: ColumnsType<Report> = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 200,
    },
    {
      title: 'Study Date',
      dataIndex: 'studyDate',
      key: 'studyDate',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, report) => (
        <Flexbox gap={8} horizontal>
          <Button
            icon={<Eye size={14} />}
            onClick={() => handleViewPDF(report)}
            size="small"
            type="primary"
          >
            View
          </Button>
          <Button icon={<Printer size={14} />} onClick={() => handlePrint(report)} size="small">
            Print
          </Button>
          <Dropdown menu={{ items: getActionItems(report) }} trigger={['click']}>
            <Button icon={<MoreVertical size={14} />} size="small" />
          </Dropdown>
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
