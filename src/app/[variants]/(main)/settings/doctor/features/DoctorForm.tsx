'use client';

import { Block, Text } from '@lobehub/ui';
import { App, Button, Form, Input, Space, Upload } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface DoctorSettings {
  license?: string;
  name: string;
  signature?: string;
  specialty?: string;
  stamp?: string;
}

const DoctorForm = () => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm<DoctorSettings>();
  const { message } = App.useApp();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();
      // TODO: Save to database/store
      console.log('Doctor Settings:', values);
      message.success('Doctor settings saved successfully');
    } catch (error) {
      message.error('Failed to save doctor settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form
      disabled={isSaving}
      form={form}
      initialValues={{
        name: 'Dr. Radiologist',
        specialty: 'Radiology',
      }}
      layout="vertical"
      requiredMark={false}
    >
      <Flexbox gap={24}>
        {/* Doctor Information */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Doctor Information</Text>
              <Text type={'secondary'}>Personal details for report signatures</Text>
            </Flexbox>

            <Form.Item
              label="Doctor Name"
              name="name"
              rules={[{ message: 'Doctor name is required', required: true }]}
            >
              <Input placeholder="Dr. John Smith" />
            </Form.Item>

            <Form.Item label="Specialty" name="specialty">
              <Input placeholder="Radiology" />
            </Form.Item>

            <Form.Item label="Medical License Number" name="license">
              <Input placeholder="License or registration number" />
            </Form.Item>
          </Flexbox>
        </Block>

        {/* Signature & Stamp */}
        <Block
          paddingBlock={16}
          paddingInline={24}
          style={{ borderRadius: 12 }}
          variant={'outlined'}
        >
          <Flexbox gap={24}>
            <Flexbox>
              <Text as={'h4'}>Digital Signature & Stamp</Text>
              <Text type={'secondary'}>Upload or draw your signature for PDF reports</Text>
            </Flexbox>

            <Form.Item label="Signature Image" name="signature" valuePropName="fileList">
              <Upload accept="image/*" listType="picture-card" maxCount={1}>
                <div>
                  <div style={{ marginTop: 8 }}>Upload Signature</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item label="Official Stamp" name="stamp" valuePropName="fileList">
              <Upload accept="image/*" listType="picture-card" maxCount={1}>
                <div>
                  <div style={{ marginTop: 8 }}>Upload Stamp</div>
                </div>
              </Upload>
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

export default DoctorForm;
