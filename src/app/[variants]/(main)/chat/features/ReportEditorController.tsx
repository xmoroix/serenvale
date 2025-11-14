'use client';

import { useReportEditorStore } from '@/store/report';

import ReportEditorModal from './ReportEditorModal';

/**
 * ReportEditorController - Manages the report editor modal state
 * Opens when triggered by the global report editor store
 */
const ReportEditorController = () => {
  const { isVisible, currentReport, closeEditor } = useReportEditorStore();

  if (!isVisible || !currentReport) {
    return null;
  }

  return (
    <ReportEditorModal
      onClose={closeEditor}
      report={currentReport}
      visible={isVisible}
    />
  );
};

export default ReportEditorController;
