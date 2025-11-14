'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export interface StudyMetadata {
  accessionNumber: string;
  modality: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  studyDescription: string;
}

export interface RadiologyContext {
  isEditing: boolean;
  isRadiologyMode: boolean;
  reportId?: string;
  studyId?: string;
  studyMetadata?: StudyMetadata;
}

/**
 * Hook to detect radiology report context from URL parameters
 *
 * Usage:
 * const { isRadiologyMode, studyMetadata } = useRadiologyContext();
 *
 * URL format:
 * /chat?mode=radiology-report&studyId=std_001&patientName=John+Doe&modality=CT...
 */
export const useRadiologyContext = (): RadiologyContext => {
  const searchParams = useSearchParams();

  const isRadiologyMode = searchParams.get('mode') === 'radiology-report';
  const isEditing = searchParams.get('edit') === 'true';
  const studyId = searchParams.get('studyId') || undefined;
  const reportId = searchParams.get('reportId') || undefined;

  const studyMetadata = useMemo(() => {
    if (!isRadiologyMode) return undefined;

    return {
      patientName: searchParams.get('patientName') || '',
      patientId: searchParams.get('patientId') || '',
      modality: searchParams.get('modality') || '',
      studyDate: searchParams.get('studyDate') || '',
      studyDescription: searchParams.get('studyDescription') || '',
      accessionNumber: searchParams.get('accessionNumber') || '',
    };
  }, [searchParams, isRadiologyMode]);

  return {
    isRadiologyMode,
    studyId,
    reportId,
    isEditing,
    studyMetadata,
  };
};
