'use client';

import { useState } from 'react';

import ReportEditorModal from './ReportEditorModal';

/**
 * ReportEditorController - Manages the report editor modal state
 * Only renders the modal when actually needed to avoid SSR issues
 */
const ReportEditorController = () => {
  const [isVisible, setIsVisible] = useState(false);

  // TODO: Wire this to topic click events (orange dot topics)
  // For now, the modal is hidden and won't cause SSR errors

  if (!isVisible) {
    return null;
  }

  // Mock data for when modal is shown
  const mockReport = {
    aiContent: 'Report content will be loaded from the topic...',
    patientInfo: {
      id: 'P000',
      name: 'Patient Name',
      date: new Date().toLocaleDateString(),
      modality: 'CT',
    },
    status: 'draft' as const,
  };

  return (
    <ReportEditorModal
      onClose={() => setIsVisible(false)}
      report={mockReport}
      visible={isVisible}
    />
  );
};

export default ReportEditorController;
