'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Badge, Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Flexbox } from 'react-layout-kit';

import type { Study } from '../_layout/Desktop';

interface StudyTableProps {
  loading: boolean;
  studies: Study[];
}

const StudyTable = ({ studies, loading }: StudyTableProps) => {
  const router = useRouter();
  const { message } = App.useApp();

  const handleOpenWeasis = (study: Study) => {
    // TODO: Generate Weasis URI and launch viewer
    const weasisUri = `weasis://studyUID=${study.studyInstanceUID}`;
    message.info(`Opening in Weasis: ${weasisUri} (implementation pending)`);
  };

  const handleStartReport = (study: Study) => {
    // Navigate to /chat with study context for report generation
    const params = new URLSearchParams({
      studyId: study.id,
      patientName: study.patientName,
      patientId: study.patientId,
      modality: study.modality,
      studyDate: study.date,
      studyDescription: study.studyDescription || '',
      accessionNumber: study.accessionNumber || '',
      mode: 'radiology-report',
    });
    router.push(`/chat?${params.toString()}`);
  };

  const columns: ColumnsType<Study> = [
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
      width: 220,
      render: (_, study) => (
        <Flexbox gap={8} horizontal>
          <Button
            icon={<ExternalLink size={14} />}
            onClick={() => handleOpenWeasis(study)}
            size="small"
          >
            View
          </Button>
          <Button
            icon={<FileText size={14} />}
            onClick={() => handleStartReport(study)}
            size="small"
            type="primary"
          >
            Report
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
            <Text as={'h3'}>Study List</Text>
            <Text type={'secondary'}>{studies.length} studies found</Text>
          </Flexbox>
        </Flexbox>

        <Table
          columns={columns}
          dataSource={studies}
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowKey="id"
          scroll={{ x: 1200 }}
          size="small"
        />
      </Flexbox>
    </Block>
  );
};

export default StudyTable;
