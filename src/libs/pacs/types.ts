/**
 * PACS/DICOM type definitions
 */

/**
 * PACS connection configuration
 */
export interface PACSConfig {
  /**
   * Local Application Entity (AE) Title
   */
  localAeTitle: string;

  /**
   * Remote PACS Application Entity (AE) Title
   */
  remoteAeTitle: string;

  /**
   * PACS server host address
   */
  host: string;

  /**
   * PACS server port (default: 104 for DICOM)
   */
  port: number;

  /**
   * Optional authentication credentials
   */
  auth?: {
    password?: string;
    username?: string;
  };

  /**
   * Connection timeout in milliseconds
   */
  timeout?: number;
}

/**
 * C-FIND query parameters for study search
 */
export interface StudyQueryParams {
  /**
   * Accession number
   */
  accessionNumber?: string;

  /**
   * Study date (YYYYMMDD or range YYYYMMDD-YYYYMMDD)
   */
  studyDate?: string;

  /**
   * Study description
   */
  studyDescription?: string;

  /**
   * Study instance UID
   */
  studyInstanceUID?: string;

  /**
   * Modality (CT, MR, CR, DX, US, etc.)
   */
  modality?: string;

  /**
   * Patient ID
   */
  patientId?: string;

  /**
   * Patient name (supports wildcards: *)
   */
  patientName?: string;
}

/**
 * DICOM study metadata from C-FIND response
 */
export interface DicomStudy {
  /**
   * Accession number
   */
  accessionNumber: string;

  /**
   * Institution name
   */
  institutionName?: string;

  /**
   * Study modalities
   */
  modalities: string;

  /**
   * Number of series
   */
  numberOfSeries?: number;

  /**
   * Number of study-related instances
   */
  numberOfStudyRelatedInstances?: number;

  /**
   * Patient birth date (YYYYMMDD)
   */
  patientBirthDate?: string;

  /**
   * Patient ID
   */
  patientId: string;

  /**
   * Patient name
   */
  patientName: string;

  /**
   * Patient sex (M/F/O)
   */
  patientSex?: string;

  /**
   * Referring physician name
   */
  referringPhysicianName?: string;

  /**
   * Study date (YYYYMMDD)
   */
  studyDate: string;

  /**
   * Study description
   */
  studyDescription: string;

  /**
   * Study instance UID (unique identifier)
   */
  studyInstanceUID: string;

  /**
   * Study time (HHMMSS)
   */
  studyTime?: string;
}

/**
 * C-FIND query result
 */
export interface CFindResult {
  /**
   * Whether the query was successful
   */
  success: boolean;

  /**
   * Array of matching studies
   */
  studies: DicomStudy[];

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Total number of results
   */
  totalResults: number;
}

/**
 * C-STORE parameters for sending reports to PACS
 */
export interface CStoreParams {
  /**
   * DICOM file buffer or path
   */
  dicomData: Buffer | string;

  /**
   * SOP Class UID (for encapsulated PDFs, etc.)
   */
  sopClassUID: string;

  /**
   * SOP Instance UID
   */
  sopInstanceUID: string;
}

/**
 * C-STORE result
 */
export interface CStoreResult {
  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Whether the store was successful
   */
  success: boolean;
}

/**
 * DICOM priority levels
 */
export enum DicomPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
}
