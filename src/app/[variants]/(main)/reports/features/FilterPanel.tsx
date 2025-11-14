'use client';

import { Block, Text } from '@lobehub/ui';
import { DatePicker, Form, Select, Space } from 'antd';
import { Flexbox } from 'react-layout-kit';

const { RangePicker } = DatePicker;

interface ReportFilters {
  dateRange?: [any, any];
  modality?: string;
  status?: string;
}

const FilterPanel = () => {
  const [form] = Form.useForm<ReportFilters>();

  return (
    <Block paddingBlock={16} paddingInline={24} style={{ borderRadius: 12 }} variant={'outlined'}>
      <Flexbox gap={16}>
        <Flexbox>
          <Text as={'h3'}>Filter Reports</Text>
          <Text type={'secondary'}>Filter by date, modality, or status</Text>
        </Flexbox>

        <Form form={form} layout="horizontal" requiredMark={false}>
          <Space size="middle" wrap>
            <Form.Item label="Date Range" name="dateRange" style={{ marginBottom: 0 }}>
              <RangePicker />
            </Form.Item>

            <Form.Item label="Modality" name="modality" style={{ marginBottom: 0 }}>
              <Select allowClear placeholder="All" style={{ width: 150 }}>
                <Select.Option value="CT">CT</Select.Option>
                <Select.Option value="MR">MR</Select.Option>
                <Select.Option value="CR">CR</Select.Option>
                <Select.Option value="DX">DX</Select.Option>
                <Select.Option value="US">US</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Status" name="status" style={{ marginBottom: 0 }}>
              <Select allowClear placeholder="All" style={{ width: 150 }}>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="final">Final</Select.Option>
                <Select.Option value="signed">Signed</Select.Option>
                <Select.Option value="sent">Sent</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Flexbox>
    </Block>
  );
};

export default FilterPanel;
