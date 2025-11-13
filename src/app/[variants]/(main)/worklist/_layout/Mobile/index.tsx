'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import QueryPanel from '../../features/QueryPanel';
import StudyTable from '../../features/StudyTable';

const Mobile = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox
      height={'100%'}
      style={{ background: theme.colorBgContainer, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox gap={16} padding={16} style={{ width: '100%' }}>
        <QueryPanel />
        <StudyTable />
      </Flexbox>
    </Flexbox>
  );
});

Mobile.displayName = 'WorklistMobile';

export default Mobile;
