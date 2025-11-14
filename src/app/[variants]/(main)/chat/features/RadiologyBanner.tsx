'use client';

import { Block, Text } from '@lobehub/ui';
import { Alert, Tag } from 'antd';
import { Stethoscope } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';

import { useRadiologyContext } from '../hooks/useRadiologyContext';

const RadiologyBanner = () => {
  const { isRadiologyMode, studyMetadata, isEditing, reportId } = useRadiologyContext();

  if (!isRadiologyMode || !studyMetadata) return null;

  return (
    <Block
      paddingBlock={12}
      paddingInline={16}
      style={{ borderRadius: 8, marginBottom: 16 }}
      variant={'outlined'}
    >
      <Flexbox gap={12}>
        <Flexbox gap={8} horizontal style={{ alignItems: 'center' }}>
          <Stethoscope size={20} />
          <Text as={'h4'} style={{ margin: 0 }}>
            Radiology Report Mode
          </Text>
          {isEditing && reportId && <Tag color="orange">EDITING</Tag>}
        </Flexbox>

        <Flexbox gap={4}>
          <Text style={{ fontSize: 13 }}>
            <strong>Patient:</strong> {studyMetadata.patientName} (ID: {studyMetadata.patientId})
          </Text>
          <Text style={{ fontSize: 13 }}>
            <strong>Study:</strong> {studyMetadata.modality} - {studyMetadata.studyDescription}
          </Text>
          <Text style={{ fontSize: 13 }}>
            <strong>Date:</strong> {studyMetadata.studyDate}
            {studyMetadata.accessionNumber && (
              <span> | <strong>Accession:</strong> {studyMetadata.accessionNumber}</span>
            )}
          </Text>
        </Flexbox>

        <Alert
          description={
            isEditing
              ? 'You are editing an existing report. Changes will be saved to this report.'
              : 'Dictate or type your findings. The AI will generate a structured report based on your template. When complete, click the report in the topic list (right sidebar) to open the editor for final review.'
          }
          showIcon
          type="info"
        />
      </Flexbox>
    </Block>
  );
};

export default RadiologyBanner;
