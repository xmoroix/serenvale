'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Button, DatePicker, Form, Input, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';

import { lambdaQuery } from '@/libs/trpc/client';

import type { Study } from '../_layout/Desktop';

const { RangePicker } = DatePicker;

interface QueryFilters {
  accessionNumber?: string;
  dateRange?: [any, any];
  modality?: string;
  patientId?: string;
  patientName?: string;
  priority?: string;
}

interface QueryPanelProps {
  onQueryEnd: () => void;
  onQueryResults: (studies: Study[]) => void;
  onQueryStart: () => void;
}

const QueryPanel = ({ onQueryResults, onQueryStart, onQueryEnd }: QueryPanelProps) => {
  const [form] = Form.useForm<QueryFilters>();
  const { message } = App.useApp();

  const queryMutation = lambdaQuery.pacs.queryStudies.useMutation();

  const handleQuery = async () => {
    try {
      onQueryStart();
      const values = await form.validateFields();

      // Convert date range to DICOM format (YYYYMMDD-YYYYMMDD)
      let studyDate: string | undefined;
      if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
        const startDate = dayjs(values.dateRange[0]).format('YYYYMMDD');
        const endDate = dayjs(values.dateRange[1]).format('YYYYMMDD');
        studyDate = `${startDate}-${endDate}`;
      }

      // Query PACS via tRPC
      const result = await queryMutation.mutateAsync({
        accessionNumber: values.accessionNumber,
        modality: values.modality,
        patientId: values.patientId,
        patientName: values.patientName,
        studyDate,
      });

      if (result.success) {
        // Map PACS results to Study format
        const studies: Study[] = result.studies.map((study: any) => ({
          accessionNumber: study.accessionNumber,
          date: study.studyDate,
          id: study.id,
          modality: study.modality,
          numberOfInstances: study.numberOfInstances,
          numberOfSeries: study.numberOfSeries,
          patientId: study.patientId,
          patientName: study.patientName,
          studyDescription: study.studyDescription || '',
          studyInstanceUID: study.studyInstanceUID,
        }));

        onQueryResults(studies);
        message.success(`Found ${studies.length} studies`);
      } else {
        message.error(result.error || 'Query failed');
        onQueryResults([]);
      }
    } catch (error) {
      console.error('PACS query error:', error);
      message.error('Failed to query PACS');
      onQueryResults([]);
    } finally {
      onQueryEnd();
    }
  };

  return (
    <Block paddingBlock={16} paddingInline={24} style={{ borderRadius: 12 }} variant={'outlined'}>
      <Flexbox gap={16}>
        <Flexbox>
          <Text as={'h3'}>PACS Worklist Query</Text>
          <Text type={'secondary'}>Search for radiology studies</Text>
        </Flexbox>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Flexbox gap={12} horizontal style={{ flexWrap: 'wrap' }}>
            <Form.Item label="Patient Name" name="patientName" style={{ flex: 1, minWidth: 200 }}>
              <Input placeholder="Enter patient name" />
            </Form.Item>

            <Form.Item label="Patient ID" name="patientId" style={{ flex: 1, minWidth: 200 }}>
              <Input placeholder="Enter patient ID" />
            </Form.Item>

            <Form.Item
              label="Accession Number"
              name="accessionNumber"
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="Enter accession #" />
            </Form.Item>
          </Flexbox>

          <Flexbox gap={12} horizontal style={{ flexWrap: 'wrap' }}>
            <Form.Item label="Study Date Range" name="dateRange" style={{ flex: 1, minWidth: 200 }}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Modality" name="modality" style={{ flex: 1, minWidth: 150 }}>
              <Select allowClear placeholder="All modalities">
                <Select.Option value="CT">CT</Select.Option>
                <Select.Option value="MR">MR (IRM)</Select.Option>
                <Select.Option value="CR">CR</Select.Option>
                <Select.Option value="DX">DX (Radiography)</Select.Option>
                <Select.Option value="US">US (Ultrasound)</Select.Option>
                <Select.Option value="MG">MG (Mammography)</Select.Option>
                <Select.Option value="NM">NM (Nuclear Medicine)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Priority" name="priority" style={{ flex: 1, minWidth: 150 }}>
              <Select allowClear placeholder="All priorities">
                <Select.Option value="STAT">STAT</Select.Option>
                <Select.Option value="URGENT">URGENT</Select.Option>
                <Select.Option value="ROUTINE">ROUTINE</Select.Option>
              </Select>
            </Form.Item>
          </Flexbox>

          <Space>
            <Button icon={<Search size={16} />} onClick={handleQuery} type="primary">
              Query PACS
            </Button>
            <Button onClick={() => form.resetFields()}>Clear</Button>
          </Space>
        </Form>
      </Flexbox>
    </Block>
  );
};

export default QueryPanel;
