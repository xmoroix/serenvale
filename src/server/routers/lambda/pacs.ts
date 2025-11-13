/**
 * PACS tRPC router
 *
 * Provides endpoints for DICOM PACS operations including:
 * - C-FIND: Query studies from PACS
 * - C-STORE: Send reports to PACS
 * - C-ECHO: Test PACS connection
 */

import { z } from 'zod';

import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { findStudies, formatDicomDate, formatDicomPatientName } from '@/libs/pacs/cfind';
import { createPACSClient } from '@/libs/pacs/client';
import { SOPClassUIDs, storeReportPDF } from '@/libs/pacs/cstore';
import type { DicomStudy, PACSConfig, StudyQueryParams } from '@/libs/pacs/types';

/**
 * Get PACS configuration from settings
 * TODO: Load from database settings table
 */
function getPACSConfig(): PACSConfig {
  // Placeholder - should load from database
  return {
    localAeTitle: process.env.PACS_LOCAL_AE_TITLE || 'SERENVALE',
    remoteAeTitle: process.env.PACS_REMOTE_AE_TITLE || 'PACS',
    host: process.env.PACS_HOST || 'localhost',
    port: Number.parseInt(process.env.PACS_PORT || '11112', 10),
    timeout: 30000,
  };
}

export const pacsRouter = router({
  /**
   * Test PACS connection using C-ECHO
   */
  testConnection: authedProcedure.query(async () => {
    try {
      const config = getPACSConfig();
      const client = createPACSClient(config);
      const connected = await client.testConnection();

      return {
        success: connected,
        config: {
          host: config.host,
          port: config.port,
          localAeTitle: config.localAeTitle,
          remoteAeTitle: config.remoteAeTitle,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }),

  /**
   * Query PACS for studies using C-FIND
   */
  queryStudies: authedProcedure
    .input(
      z.object({
        patientName: z.string().optional(),
        patientId: z.string().optional(),
        accessionNumber: z.string().optional(),
        studyDate: z.string().optional(),
        modality: z.string().optional(),
        studyDescription: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const config = getPACSConfig();
      const queryParams: StudyQueryParams = {
        patientName: input.patientName,
        patientId: input.patientId,
        accessionNumber: input.accessionNumber,
        studyDate: input.studyDate,
        modality: input.modality,
        studyDescription: input.studyDescription,
      };

      const result = await findStudies(config, queryParams);

      // Format studies for UI
      const formattedStudies = result.studies.map((study: DicomStudy) => ({
        id: study.studyInstanceUID,
        studyInstanceUID: study.studyInstanceUID,
        patientName: formatDicomPatientName(study.patientName),
        patientNameRaw: study.patientName,
        patientId: study.patientId,
        patientBirthDate: study.patientBirthDate
          ? formatDicomDate(study.patientBirthDate)
          : undefined,
        patientSex: study.patientSex,
        studyDate: formatDicomDate(study.studyDate),
        studyDateRaw: study.studyDate,
        studyTime: study.studyTime,
        modality: study.modalities,
        studyDescription: study.studyDescription,
        accessionNumber: study.accessionNumber,
        numberOfSeries: study.numberOfSeries,
        numberOfInstances: study.numberOfStudyRelatedInstances,
        institutionName: study.institutionName,
        referringPhysicianName: study.referringPhysicianName,
      }));

      return {
        success: result.success,
        studies: formattedStudies,
        totalResults: result.totalResults,
        error: result.error,
      };
    }),

  /**
   * Send report PDF to PACS using C-STORE as Encapsulated PDF
   */
  sendReportToPACS: authedProcedure
    .input(
      z.object({
        pdfBase64: z.string(),
        studyInstanceUID: z.string(),
        patientName: z.string(),
        patientId: z.string(),
        studyDate: z.string(),
        accessionNumber: z.string(),
        studyDescription: z.string().optional(),
        patientBirthDate: z.string().optional(),
        patientSex: z.string().optional(),
        institutionName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const config = getPACSConfig();

        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(input.pdfBase64, 'base64');

        // Generate SOP Instance UID for the report
        const sopInstanceUID = `2.25.${Date.now()}${Math.floor(Math.random() * 1000000)}`;

        // Get current date/time for report
        const now = new Date();
        const reportDate = now.toISOString().slice(0, 10).replaceAll('-', ''); // YYYYMMDD
        const reportTime = now.toTimeString().slice(0, 8).replaceAll(':', ''); // HHMMSS

        const result = await storeReportPDF(config, pdfBuffer, {
          studyInstanceUID: input.studyInstanceUID,
          patientName: input.patientName,
          patientId: input.patientId,
          studyDate: input.studyDate,
          accessionNumber: input.accessionNumber,
          studyDescription: input.studyDescription,
          patientBirthDate: input.patientBirthDate,
          patientSex: input.patientSex,
          institutionName: input.institutionName,
          sopInstanceUID,
          reportDate,
          reportTime,
        });

        return {
          success: result.success,
          error: result.error,
          sopInstanceUID: result.success ? sopInstanceUID : undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to send report',
        };
      }
    }),

  /**
   * Get PACS configuration (for settings display)
   */
  getConfig: authedProcedure.query(async () => {
    const config = getPACSConfig();

    return {
      localAeTitle: config.localAeTitle,
      remoteAeTitle: config.remoteAeTitle,
      host: config.host,
      port: config.port,
      timeout: config.timeout,
    };
  }),
});

export type PACSRouter = typeof pacsRouter;
