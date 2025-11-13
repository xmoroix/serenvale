'use client';

import { useResponsive, useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import QueryPanel from '../../features/QueryPanel';
import StudyTable from '../../features/StudyTable';

const Desktop = memo(() => {
  const theme = useTheme();
  const { md = true } = useResponsive();

  return (
    <Flexbox
      height={'100%'}
      style={{ background: theme.colorBgContainer, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox gap={24} padding={24} style={{ maxWidth: 1400, width: '100%' }}>
        <QueryPanel />
        <StudyTable />
      </Flexbox>
    </Flexbox>
  );
});

Desktop.displayName = 'WorklistDesktop';

export default Desktop;
