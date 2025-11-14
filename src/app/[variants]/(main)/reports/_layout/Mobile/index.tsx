'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ReportEditorController from '@/app/[variants]/(main)/chat/features/ReportEditorController';

import FilterPanel from '../../features/FilterPanel';
import ReportsTable from '../../features/ReportsTable';

const Mobile = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox
      height={'100%'}
      style={{ background: theme.colorBgContainer, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox gap={16} padding={16} style={{ width: '100%' }}>
        <FilterPanel />
        <ReportsTable />
      </Flexbox>

      {/* Report Editor Modal */}
      <ReportEditorController />
    </Flexbox>
  );
});

Mobile.displayName = 'ReportsMobile';

export default Mobile;
