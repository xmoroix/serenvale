/**
 * C-FIND implementation for DICOM study queries
 *
 * Provides functions to query PACS for studies, series, and images using
 * DICOM C-FIND protocol at the Study Root level.
 */

import type { CFindResult, DicomStudy, PACSConfig, StudyQueryParams } from './types';

/**
 * Convert query parameters to DICOM dataset format
 *
 * @param params - Study query parameters
 * @returns DICOM dataset object for C-FIND request
 */
function buildStudyQueryDataset(params: StudyQueryParams): Record<string, any> {
  const dataset: Record<string, any> = {
    // Query/Retrieve Level - STUDY
    '00080052': { vr: 'CS', Value: ['STUDY'] },

    // Return keys - these will be populated in the response
    '00080020': { vr: 'DA', Value: params.studyDate ? [params.studyDate] : [''] }, // StudyDate
    '00080050': { vr: 'SH', Value: params.accessionNumber ? [params.accessionNumber] : [''] }, // AccessionNumber
    '00080061': { vr: 'CS', Value: params.modality ? [params.modality] : [''] }, // ModalitiesInStudy
    '0020000D': { vr: 'UI', Value: params.studyInstanceUID ? [params.studyInstanceUID] : [''] }, // StudyInstanceUID
    '00100010': { vr: 'PN', Value: params.patientName ? [params.patientName] : [''] }, // PatientName
    '00100020': { vr: 'PN', Value: params.patientId ? [params.patientId] : [''] }, // PatientID

    // Optional return keys
    '00080030': { vr: 'TM', Value: [''] }, // StudyTime
    '00080080': { vr: 'LO', Value: [''] }, // InstitutionName
    '00080090': { vr: 'PN', Value: [''] }, // ReferringPhysicianName
    '00081030': { vr: 'LO', Value: params.studyDescription ? [params.studyDescription] : [''] }, // StudyDescription
    '00100030': { vr: 'DA', Value: [''] }, // PatientBirthDate
    '00100040': { vr: 'CS', Value: [''] }, // PatientSex
    '00201206': { vr: 'IS', Value: [''] }, // NumberOfStudyRelatedSeries
    '00201208': { vr: 'IS', Value: [''] }, // NumberOfStudyRelatedInstances
  };

  return dataset;
}

/**
 * Parse DICOM dataset from C-FIND response to DicomStudy object
 *
 * @param dataset - DICOM dataset from C-FIND response
 * @returns Parsed study metadata
 */
function parseDicomDataset(dataset: Record<string, any>): DicomStudy {
  // Helper to safely extract value from DICOM tag
  const getValue = (tag: string, defaultValue: string = ''): string => {
    const element = dataset[tag];
    if (!element?.Value?.[0]) return defaultValue;

    return String(element.Value[0]);
  };

  return {
    studyInstanceUID: getValue('0020000D'),
    studyDate: getValue('00080020'),
    studyTime: getValue('00080030'),
    accessionNumber: getValue('00080050'),
    modalities: getValue('00080061'),
    patientName: getValue('00100010'),
    patientId: getValue('00100020'),
    patientBirthDate: getValue('00100030'),
    patientSex: getValue('00100040'),
    studyDescription: getValue('00081030'),
    institutionName: getValue('00080080'),
    referringPhysicianName: getValue('00080090'),
    numberOfSeries: Number.parseInt(getValue('00201206', '0'), 10),
    numberOfStudyRelatedInstances: Number.parseInt(getValue('00201208', '0'), 10),
  };
}

/**
 * Execute C-FIND query to search for studies in PACS
 *
 * @param config - PACS connection configuration
 * @param params - Study query parameters (filters)
 * @returns Promise resolving to query results
 */
export async function findStudies(
  config: PACSConfig,
  params: StudyQueryParams,
): Promise<CFindResult> {
  try {
    // TODO: Implement actual C-FIND using dcmjs-dimse
    // const dimse = require('dcmjs-dimse');
    // const queryDataset = buildStudyQueryDataset(params);
    //
    // const result = await dimse.CFind({
    //   source: {
    //     aet: config.localAeTitle
    //   },
    //   target: {
    //     aet: config.remoteAeTitle,
    //     host: config.host,
    //     port: config.port
    //   },
    //   dataset: queryDataset
    // });
    //
    // const studies = result.datasets.map(parseDicomDataset);
    //
    // return {
    //   success: true,
    //   studies,
    //   totalResults: studies.length
    // };

    console.log('C-FIND query:', params);
    console.log('PACS config:', config.host, ':', config.port);

    // Placeholder - return mock data for now
    const mockStudies: DicomStudy[] = [
      {
        studyInstanceUID: '1.2.840.113619.2.55.1.1762868112.1756.1234567890.1',
        studyDate: '20241113',
        studyTime: '143022',
        accessionNumber: 'ACC001',
        modalities: 'CT',
        patientName: 'DOE^JOHN',
        patientId: 'P123456',
        patientBirthDate: '19750515',
        patientSex: 'M',
        studyDescription: 'CT CHEST W/O CONTRAST',
        institutionName: 'General Hospital',
        referringPhysicianName: 'SMITH^ROBERT',
        numberOfSeries: 3,
        numberOfStudyRelatedInstances: 150,
      },
      {
        studyInstanceUID: '1.2.840.113619.2.55.1.1762868112.1756.1234567890.2',
        studyDate: '20241113',
        studyTime: '151530',
        accessionNumber: 'ACC002',
        modalities: 'MR',
        patientName: 'SMITH^JANE',
        patientId: 'P789012',
        patientBirthDate: '19820310',
        patientSex: 'F',
        studyDescription: 'MR BRAIN W/WO CONTRAST',
        institutionName: 'General Hospital',
        referringPhysicianName: 'JONES^MARY',
        numberOfSeries: 5,
        numberOfStudyRelatedInstances: 320,
      },
    ];

    // Filter mock data based on params
    let filteredStudies = mockStudies;

    if (params.patientName) {
      const searchTerm = params.patientName.toUpperCase().replace('*', '');
      filteredStudies = filteredStudies.filter((s) => s.patientName.includes(searchTerm));
    }

    if (params.patientId) {
      filteredStudies = filteredStudies.filter((s) => s.patientId.includes(params.patientId!));
    }

    if (params.modality) {
      filteredStudies = filteredStudies.filter((s) => s.modalities.includes(params.modality!));
    }

    if (params.accessionNumber) {
      filteredStudies = filteredStudies.filter((s) =>
        s.accessionNumber.includes(params.accessionNumber!),
      );
    }

    return {
      success: true,
      studies: filteredStudies,
      totalResults: filteredStudies.length,
    };
  } catch (error) {
    console.error('C-FIND query failed:', error);

    return {
      success: false,
      studies: [],
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format DICOM date (YYYYMMDD) to human-readable format
 *
 * @param dicomDate - Date in DICOM format (YYYYMMDD)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDicomDate(dicomDate: string): string {
  if (!dicomDate || dicomDate.length !== 8) return dicomDate;

  const year = dicomDate.slice(0, 4);
  const month = dicomDate.slice(4, 6);
  const day = dicomDate.slice(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Format DICOM time (HHMMSS) to human-readable format
 *
 * @param dicomTime - Time in DICOM format (HHMMSS or HHMMSS.FFFFFF)
 * @returns Formatted time string (HH:MM:SS)
 */
export function formatDicomTime(dicomTime: string): string {
  if (!dicomTime || dicomTime.length < 6) return dicomTime;

  const hours = dicomTime.slice(0, 2);
  const minutes = dicomTime.slice(2, 4);
  const seconds = dicomTime.slice(4, 6);

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format DICOM patient name (Last^First^Middle) to readable format
 *
 * @param dicomName - Name in DICOM format (Last^First^Middle^Prefix^Suffix)
 * @returns Formatted name string (First Last)
 */
export function formatDicomPatientName(dicomName: string): string {
  if (!dicomName) return '';

  const parts = dicomName.split('^');
  const lastName = parts[0] || '';
  const firstName = parts[1] || '';

  return `${firstName} ${lastName}`.trim();
}
