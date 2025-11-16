'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Button, Form, Input, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { lambdaQuery } from '@/libs/trpc/client';

interface PACSSettings {
  aeTitle: string;
  host: string;
  password?: string;
  port: number;
  queryNode?: string;
  storeNode?: string;
  username?: string;
}

const PACSForm = () => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm<PACSSettings>();
  const { message } = App.useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);

  // Load clinic config on mount
  const { data: clinicConfig, isLoading } = lambdaQuery.clinicConfig.getOrCreateConfig.useQuery();

  // Set form values when config loads
  useEffect(() => {
    if (clinicConfig) {
      setClinicId(clinicConfig.id);
      if (clinicConfig.pacsConfig) {
        form.setFieldsValue(clinicConfig.pacsConfig);
      }
    }
  }, [clinicConfig, form]);

  // Mutation for updating PACS config
  const updatePacsMutation = lambdaQuery.clinicConfig.updatePacsConfig.useMutation();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      if (!clinicId) {
        throw new Error('Clinic configuration not found');
      }

      await updatePacsMutation.mutateAsync({
        id: clinicId,
        ...values,
      });

      message.success(t('settingPACS.saveSuccess', 'PACS settings saved successfully'));
    } catch (error) {
      console.error('Failed to save PACS settings:', error);
      message.error(
        t('settingPACS.saveFailed', 'Failed to save PACS settings: {{error}}', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flexbox align="center" justify="center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </Flexbox>
    );
  }

  return (
    <Form disabled={isSaving} form={form} layout="vertical" requiredMark={false}>
      <Flexbox gap={24}>
        {/* Basic PACS Settings */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>PACS Connection</Text>
              <Text type={'secondary'}>Configure DICOM PACS server connection settings</Text>
            </Flexbox>

            <Form.Item
              label="AE Title"
              name="aeTitle"
              rules={[{ message: 'AE Title is required', required: true }]}
            >
              <Input placeholder="SERENVALE" />
            </Form.Item>

            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                label="PACS Host"
                name="host"
                rules={[{ message: 'PACS host is required', required: true }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="localhost or IP address" />
              </Form.Item>

              <Form.Item
                label="Port"
                name="port"
                rules={[
                  { message: 'Port is required', required: true },
                  {
                    message: 'Invalid port number',
                    pattern: /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                  },
                ]}
                style={{ marginBottom: 0, width: 120 }}
              >
                <Input placeholder="11112" type="number" />
              </Form.Item>
            </Space.Compact>
          </Flexbox>
        </Block>

        {/* DICOM Nodes */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>DICOM Nodes</Text>
              <Text type={'secondary'}>Configure C-FIND (query) and C-STORE (send) nodes</Text>
            </Flexbox>

            <Form.Item label="Query Node (C-FIND)" name="queryNode">
              <Input placeholder="PACS_QUERY or leave empty to use AE Title" />
            </Form.Item>

            <Form.Item label="Store Node (C-STORE)" name="storeNode">
              <Input placeholder="PACS_STORE or leave empty to use AE Title" />
            </Form.Item>
          </Flexbox>
        </Block>

        {/* Authentication (Optional) */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Authentication (Optional)</Text>
              <Text type={'secondary'}>HL7 or custom authentication credentials</Text>
            </Flexbox>

            <Form.Item label="Username" name="username">
              <Input placeholder="Optional username for PACS authentication" />
            </Form.Item>

            <Form.Item label="Password" name="password">
              <Input.Password placeholder="Optional password for PACS authentication" />
            </Form.Item>
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

export default PACSForm;
