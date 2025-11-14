'use client';

import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { Study } from '../Desktop';
import QueryPanel from '../../features/QueryPanel';
import StudyTable from '../../features/StudyTable';

const Mobile = memo(() => {
  const theme = useTheme();
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Flexbox
      height={'100%'}
      style={{ background: theme.colorBgContainer, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox gap={16} padding={16} style={{ width: '100%' }}>
        <QueryPanel onQueryResults={setStudies} onQueryStart={() => setIsLoading(true)} onQueryEnd={() => setIsLoading(false)} />
        <StudyTable studies={studies} loading={isLoading} />
      </Flexbox>
    </Flexbox>
  );
});

Mobile.displayName = 'WorklistMobile';

export default Mobile;
