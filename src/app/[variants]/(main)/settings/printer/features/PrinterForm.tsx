'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Button, Form, Input, Select, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface PrinterSettings {
  paperSize: string;
  printerName?: string;
  quality?: string;
}

const PrinterForm = () => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm<PrinterSettings>();
  const { message } = App.useApp();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();
      // TODO: Save to database/store
      console.log('Printer Settings:', values);
      message.success('Printer settings saved successfully');
    } catch (error) {
      message.error('Failed to save printer settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form
      disabled={isSaving}
      form={form}
      initialValues={{
        paperSize: 'A4',
        quality: 'high',
      }}
      layout="vertical"
      requiredMark={false}
    >
      <Flexbox gap={24}>
        {/* Printer Configuration */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Printer Configuration</Text>
              <Text type={'secondary'}>Default printer settings for report printing</Text>
            </Flexbox>

            <Form.Item label="Network Printer Name" name="printerName">
              <Input placeholder="HP_LaserJet_Pro or leave empty for default printer" />
            </Form.Item>

            <Form.Item label="Paper Size" name="paperSize">
              <Select>
                <Select.Option value="A4">A4 (210 × 297 mm)</Select.Option>
                <Select.Option value="Letter">Letter (8.5 × 11 in)</Select.Option>
                <Select.Option value="Legal">Legal (8.5 × 14 in)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Print Quality" name="quality">
              <Select>
                <Select.Option value="draft">Draft (Fast)</Select.Option>
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="high">High Quality</Select.Option>
              </Select>
            </Form.Item>
          </Flexbox>
        </Block>

        {/* Print Preview */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={16}>
            <Flexbox>
              <Text as={'h4'}>Test Print</Text>
              <Text type={'secondary'}>Test your printer configuration</Text>
            </Flexbox>

            <Button onClick={() => message.info('Test print functionality coming soon')}>
              Print Test Page
            </Button>
          </Flexbox>
        </Block>

        {/* Action Buttons */}
        <Space>
          <Button loading={isSaving} onClick={handleSave} type="primary">
            Save Settings
          </Button>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Space>
      </Flexbox>
    </Form>
  );
};

export default PrinterForm;
