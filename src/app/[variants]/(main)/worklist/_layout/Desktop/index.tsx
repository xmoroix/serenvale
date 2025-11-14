'use client';

import { useResponsive, useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import QueryPanel from '../../features/QueryPanel';
import StudyTable from '../../features/StudyTable';

export interface Study {
  accessionNumber: string;
  date: string;
  id: string;
  modality: string;
  numberOfInstances?: number;
  numberOfSeries?: number;
  patientId: string;
  patientName: string;
  studyDescription: string;
  studyInstanceUID: string;
}

const Desktop = memo(() => {
  const theme = useTheme();
  const { md = true } = useResponsive();
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Flexbox
      height={'100%'}
      style={{ background: theme.colorBgContainer, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox gap={24} padding={24} style={{ width: '100%' }}>
        <QueryPanel onQueryResults={setStudies} onQueryStart={() => setIsLoading(true)} onQueryEnd={() => setIsLoading(false)} />
        <StudyTable studies={studies} loading={isLoading} />
      </Flexbox>
    </Flexbox>
  );
});

Desktop.displayName = 'WorklistDesktop';

export default Desktop;
