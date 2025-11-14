/**
 * C-STORE implementation for sending DICOM objects to PACS
 *
 * Handles storage of radiology reports as DICOM Encapsulated PDF objects.
 */

import type { CStoreParams, CStoreResult, PACSConfig } from './types';

/**
 * DICOM SOP Class UIDs for different object types
 */
export const SOPClassUIDs = {
  /**
   * Encapsulated PDF Storage - for radiology reports
   */
  EncapsulatedPDF: '1.2.840.10008.5.1.4.1.1.104.1',

  /**
   * Secondary Capture Image Storage
   */
  SecondaryCaptureImage: '1.2.840.10008.5.1.4.1.1.7',

  /**
   * Structured Report Document Storage
   */
  StructuredReport: '1.2.840.10008.5.1.4.1.1.88.11',
} as const;

/**
 * Create DICOM Encapsulated PDF from PDF buffer and study metadata
 *
 * @param pdfBuffer - PDF file as buffer
 * @param metadata - Study and patient metadata
 * @returns DICOM dataset with encapsulated PDF
 */
export function createEncapsulatedPDF(
  pdfBuffer: Buffer,
  metadata: {
    accessionNumber: string;
    institutionName?: string;
    patientBirthDate?: string;
    patientId: string;
    patientName: string;
    patientSex?: string;
    reportDate?: string;
    reportTime?: string;
    seriesInstanceUID?: string;
    sopInstanceUID: string;
    studyDate: string;
    studyDescription?: string;
    studyInstanceUID: string;
  },
): Record<string, any> {
  // Generate UIDs if not provided
  const seriesUID = metadata.seriesInstanceUID || generateUID();
  const sopUID = metadata.sopInstanceUID;

  // Build DICOM dataset for Encapsulated PDF
  const dataset: Record<string, any> = {
    // SOP Common Module
    '00080005': { vr: 'CS', Value: ['ISO_IR 192'] }, // Specific Character Set (UTF-8)
    '00080016': { vr: 'UI', Value: [SOPClassUIDs.EncapsulatedPDF] }, // SOP Class UID
    '00080018': { vr: 'UI', Value: [sopUID] }, // SOP Instance UID

    // Patient Module
    '00100010': { vr: 'PN', Value: [metadata.patientName] }, // Patient Name
    '00100020': { vr: 'LO', Value: [metadata.patientId] }, // Patient ID

    // Study Module
    '0020000D': { vr: 'UI', Value: [metadata.studyInstanceUID] }, // Study Instance UID
    '00080020': { vr: 'DA', Value: [metadata.studyDate] }, // Study Date
    '00080050': { vr: 'SH', Value: [metadata.accessionNumber] }, // Accession Number

    // Series Module
    '0020000E': { vr: 'UI', Value: [seriesUID] }, // Series Instance UID
    '00080060': { vr: 'CS', Value: ['SR'] }, // Modality (Structured Report)
    '00200011': { vr: 'IS', Value: ['1'] }, // Series Number

    // Encapsulated Document Module
    '00420011': { vr: 'OB', Value: [pdfBuffer] }, // Encapsulated Document
    '00420012': { vr: 'LO', Value: ['application/pdf'] }, // MIME Type of Encapsulated Document
    '00200013': { vr: 'IS', Value: ['1'] }, // Instance Number
  };

  // Add optional fields
  if (metadata.patientBirthDate) {
    dataset['00100030'] = { vr: 'DA', Value: [metadata.patientBirthDate] };
  }

  if (metadata.patientSex) {
    dataset['00100040'] = { vr: 'CS', Value: [metadata.patientSex] };
  }

  if (metadata.studyDescription) {
    dataset['00081030'] = { vr: 'LO', Value: [metadata.studyDescription] };
  }

  if (metadata.institutionName) {
    dataset['00080080'] = { vr: 'LO', Value: [metadata.institutionName] };
  }

  if (metadata.reportDate) {
    dataset['00080023'] = { vr: 'DA', Value: [metadata.reportDate] }; // Content Date
  }

  if (metadata.reportTime) {
    dataset['00080033'] = { vr: 'TM', Value: [metadata.reportTime] }; // Content Time
  }

  return dataset;
}

/**
 * Send DICOM object to PACS using C-STORE
 *
 * @param config - PACS connection configuration
 * @param params - C-STORE parameters
 * @returns Promise resolving to store result
 */
export async function storeDicomObject(
  config: PACSConfig,
  params: CStoreParams,
): Promise<CStoreResult> {
  try {
    // TODO: Implement actual C-STORE using dcmjs-dimse
    // const dimse = require('dcmjs-dimse');
    //
    // const result = await dimse.CStore({
    //   source: {
    //     aet: config.localAeTitle
    //   },
    //   target: {
    //     aet: config.remoteAeTitle,
    //     host: config.host,
    //     port: config.port
    //   },
    //   dataset: params.dicomData
    // });
    //
    // return {
    //   success: result.status === 0x0000,
    //   error: result.status !== 0x0000 ? `C-STORE failed with status: ${result.status}` : undefined
    // };

    console.log('C-STORE to PACS:', config.host, ':', config.port);
    console.log('SOP Class UID:', params.sopClassUID);
    console.log('SOP Instance UID:', params.sopInstanceUID);

    // Placeholder - simulate success
    return {
      success: true,
    };
  } catch (error) {
    console.error('C-STORE failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send radiology report PDF to PACS as Encapsulated PDF
 *
 * @param config - PACS connection configuration
 * @param pdfBuffer - Report PDF as buffer
 * @param metadata - Study and report metadata
 * @returns Promise resolving to store result
 */
export async function storeReportPDF(
  config: PACSConfig,
  pdfBuffer: Buffer,
  metadata: {
    accessionNumber: string;
    institutionName?: string;
    patientBirthDate?: string;
    patientId: string;
    patientName: string;
    patientSex?: string;
    reportDate?: string;
    reportTime?: string;
    sopInstanceUID: string;
    studyDate: string;
    studyDescription?: string;
    studyInstanceUID: string;
  },
): Promise<CStoreResult> {
  try {
    // Create DICOM Encapsulated PDF dataset
    const dicomDataset = createEncapsulatedPDF(pdfBuffer, metadata);

    // Send to PACS via C-STORE
    return await storeDicomObject(config, {
      dicomData: Buffer.from(JSON.stringify(dicomDataset)),
      sopClassUID: SOPClassUIDs.EncapsulatedPDF,
      sopInstanceUID: metadata.sopInstanceUID,
    });
  } catch (error) {
    console.error('Failed to store report PDF:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store report',
    };
  }
}

/**
 * Generate a DICOM UID
 * Format: 2.25.<UUID as integer>
 *
 * @returns New DICOM UID string
 */
function generateUID(): string {
  // Simple UID generation using timestamp and random number
  // In production, should use proper UUID v4 and convert to DICOM UID format
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);

  return `2.25.${timestamp}${random}`;
}
