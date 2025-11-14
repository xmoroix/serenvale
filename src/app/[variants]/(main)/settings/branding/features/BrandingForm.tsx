'use client';

import { Alert, Card, Form, Input, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Paragraph, Text } = Typography;

interface BrandingFormValues {
  appName: string;
  tagline: string;
  logo: any;
  splashScreen: any;
}

const BrandingForm = () => {
  const [form] = Form.useForm<BrandingFormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: BrandingFormValues) => {
    setLoading(true);
    try {
      console.log('Branding values:', values);
      // TODO: Implement branding save functionality
      // This will require:
      // 1. Upload images to storage (S3, local storage, etc.)
      // 2. Save branding config to database
      // 3. Update app metadata
      alert('Branding settings saved! (Not yet implemented - see console for data)');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Branding & Logo</Title>
      <Paragraph type="secondary">
        Customize your application's branding, logo, and splash screen. These changes will appear
        throughout the application.
      </Paragraph>

      <Alert
        description={
          <div>
            <Text strong>Current Limitations:</Text>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Logo/splash uploads are UI-only (backend storage not yet implemented)</li>
              <li>
                For immediate logo changes, replace files in <code>/public/icons/</code> directory
              </li>
              <li>
                See <code>BRANDING.md</code> for complete manual rebranding guide
              </li>
              <li>
                Use environment variables (<code>.env.local</code>) for app name and other text
                branding
              </li>
            </ul>
          </div>
        }
        message="Future Feature - UI Preview"
        showIcon
        style={{ marginBottom: 24 }}
        type="info"
      />

      <Form
        form={form}
        initialValues={{
          appName: process.env.NEXT_PUBLIC_APP_NAME || 'Serenvale',
          tagline: 'AI-Powered Radiology Reporting',
        }}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Card style={{ marginBottom: 16 }} title="Application Text">
          <Form.Item
            label="Application Name"
            name="appName"
            rules={[{ required: true, message: 'Please enter application name' }]}
          >
            <Input placeholder="e.g., Serenvale, MediScan, etc." />
          </Form.Item>

          <Form.Item label="Tagline / Description" name="tagline">
            <Input.TextArea
              placeholder="A short description of your application"
              rows={2}
            />
          </Form.Item>

          <Alert
            description={
              <>
                To apply these changes permanently, add to <code>.env.local</code>:
                <br />
                <code>NEXT_PUBLIC_APP_NAME=Your App Name</code>
              </>
            }
            message="Environment Variable Configuration"
            style={{ marginTop: 16 }}
            type="warning"
          />
        </Card>

        <Card style={{ marginBottom: 16 }} title="Logo">
          <Form.Item
            extra="Recommended: 512x512px PNG with transparent background"
            label="Application Logo"
            name="logo"
            valuePropName="fileList"
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
            >
              {uploadButton}
            </Upload>
          </Form.Item>

          <Alert
            description={
              <div>
                To replace logo now, update these files in <code>/public/icons/</code>:
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>
                    <code>icon-192x192.png</code> (192x192)
                  </li>
                  <li>
                    <code>icon-512x512.png</code> (512x512)
                  </li>
                  <li>
                    <code>icon-192x192.maskable.png</code> (192x192 maskable)
                  </li>
                  <li>
                    <code>icon-512x512.maskable.png</code> (512x512 maskable)
                  </li>
                  <li>
                    <code>favicon.ico</code> (16x16, 32x32)
                  </li>
                  <li>
                    <code>apple-touch-icon.png</code> (180x180)
                  </li>
                </ul>
              </div>
            }
            message="Manual Logo Replacement"
            style={{ marginTop: 16 }}
            type="info"
          />
        </Card>

        <Card title="Splash Screen">
          <Form.Item
            extra="Recommended: 1200x1200px PNG for best quality across devices"
            label="Splash Screen Image"
            name="splashScreen"
            valuePropName="fileList"
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
            >
              {uploadButton}
            </Upload>
          </Form.Item>

          <Alert
            description="Splash screens are typically configured in the PWA manifest. This feature will store custom splash screens for your application."
            message="PWA Splash Screen"
            style={{ marginTop: 16 }}
            type="info"
          />
        </Card>

        {/* Hidden for now - backend implementation needed
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button htmlType="submit" loading={loading} size="large" type="primary">
            Save Branding Settings
          </Button>
        </div>
        */}
      </Form>

      <Card style={{ marginTop: 24 }} title="Quick Branding Guide">
        <Paragraph>
          <Text strong>For immediate branding changes:</Text>
        </Paragraph>
        <ol>
          <li>
            <Text strong>Text Branding:</Text> Create <code>.env.local</code> file with environment
            variables
          </li>
          <li>
            <Text strong>Logo/Icons:</Text> Replace files in <code>/public/icons/</code> directory
          </li>
          <li>
            <Text strong>Complete Guide:</Text> See <code>BRANDING.md</code> in project root
          </li>
          <li>
            <Text strong>Restart:</Text> Run <code>bun run dev</code> to see changes
          </li>
        </ol>

        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          <Text strong>Future Enhancement:</Text> This settings page will support live uploads and
          previews once the backend storage system is implemented. Current priority is demo
          functionality with PACS and OpenAI integration.
        </Paragraph>
      </Card>
    </div>
  );
};

export default BrandingForm;
