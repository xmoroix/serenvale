'use client';

import { useResponsive, useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ReportEditorController from '@/app/[variants]/(main)/chat/features/ReportEditorController';

import FilterPanel from '../../features/FilterPanel';
import ReportsTable from '../../features/ReportsTable';

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
        <FilterPanel />
        <ReportsTable />
      </Flexbox>

      {/* Report Editor Modal */}
      <ReportEditorController />
    </Flexbox>
  );
});

Desktop.displayName = 'ReportsDesktop';

export default Desktop;
