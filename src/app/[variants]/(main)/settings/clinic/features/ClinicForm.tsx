'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Button, Form, Input, Space, Upload } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface ClinicSettings {
  address?: string;
  letterhead?: string;
  logo?: string;
  name: string;
  nif?: string;
}

const ClinicForm = () => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm<ClinicSettings>();
  const { message } = App.useApp();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();
      // TODO: Save to database/store
      console.log('Clinic Settings:', values);
      message.success('Clinic settings saved successfully');
    } catch (error) {
      message.error('Failed to save clinic settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form
      disabled={isSaving}
      form={form}
      initialValues={{
        name: 'Serenvale Radiology Center',
      }}
      layout="vertical"
      requiredMark={false}
    >
      <Flexbox gap={24}>
        {/* Clinic Information */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Clinic Information</Text>
              <Text type={'secondary'}>
                Basic clinic details for report headers and official documents
              </Text>
            </Flexbox>

            <Form.Item
              label="Clinic Name"
              name="name"
              rules={[{ message: 'Clinic name is required', required: true }]}
            >
              <Input placeholder="Serenvale Radiology Center" />
            </Form.Item>

            <Form.Item label="Address" name="address">
              <Input.TextArea
                placeholder="Complete clinic address&#10;Street, City, Postal Code, Country"
                rows={3}
              />
            </Form.Item>

            <Form.Item label="Tax ID / NIF" name="nif">
              <Input placeholder="Tax identification number" />
            </Form.Item>
          </Flexbox>
        </Block>

        {/* Branding */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Branding</Text>
              <Text type={'secondary'}>Logo and letterhead for reports</Text>
            </Flexbox>

            <Form.Item label="Logo" name="logo" valuePropName="fileList">
              <Upload accept="image/*" listType="picture-card" maxCount={1}>
                <div>
                  <div style={{ marginTop: 8 }}>Upload Logo</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item label="Letterhead Template (HTML)" name="letterhead">
              <Input.TextArea
                placeholder="HTML template for report headers&#10;Use {{clinicName}}, {{address}}, etc. as placeholders"
                rows={6}
              />
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

export default ClinicForm;
