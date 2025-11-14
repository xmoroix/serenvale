import { z } from 'zod';

import { ReportModel } from '@/database/models/report';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const reportProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { reportModel: new ReportModel(ctx.serverDB, ctx.userId) },
  });
});

export const reportRouter = router({
  /**
   * Create a new report
   */
  createReport: reportProcedure
    .input(
      z.object({
        studyId: z.string().nullable().optional(),
        content: z.string(),
        status: z.enum(['draft', 'final', 'signed', 'sent']).optional(),
        language: z.enum(['fr', 'en']).optional(),
        agentId: z.string().optional(),
        metadata: z
          .object({
            patientName: z.string().optional(),
            patientId: z.string().optional(),
            modality: z.string().optional(),
            studyDate: z.string().optional(),
            studyDescription: z.string().optional(),
            accessionNumber: z.string().optional(),
            priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.reportModel.create({
        studyId: input.studyId,
        content: input.content,
        status: input.status || 'draft',
        language: input.language || 'fr',
        agentId: input.agentId,
        version: 1,
        metadata: input.metadata as any,
      });

      return data.id;
    }),

  /**
   * Get all reports for the user
   */
  getReports: reportProcedure.query(async ({ ctx }) => {
    return ctx.reportModel.query();
  }),

  /**
   * Get reports with their studies
   */
  getReportsWithStudy: reportProcedure.query(async ({ ctx }) => {
    return ctx.reportModel.queryWithStudy();
  }),

  /**
   * Get a report by ID
   */
  getReport: reportProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.reportModel.findById(input.id);
    }),

  /**
   * Get reports for a specific study
   */
  getReportsByStudyId: reportProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.reportModel.findByStudyId(input.studyId);
    }),

  /**
   * Get the latest report for a study
   */
  getLatestReportByStudyId: reportProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.reportModel.findLatestByStudyId(input.studyId);
    }),

  /**
   * Get reports by status
   */
  getReportsByStatus: reportProcedure
    .input(z.object({ status: z.enum(['draft', 'final', 'signed', 'sent']) }))
    .query(async ({ input, ctx }) => {
      return ctx.reportModel.findByStatus(input.status);
    }),

  /**
   * Get draft reports
   */
  getDraftReports: reportProcedure.query(async ({ ctx }) => {
    return ctx.reportModel.findDrafts();
  }),

  /**
   * Get completed reports (final, signed, or sent)
   */
  getCompletedReports: reportProcedure.query(async ({ ctx }) => {
    return ctx.reportModel.findCompleted();
  }),

  /**
   * Update a report
   */
  updateReport: reportProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({
          content: z.string().optional(),
          status: z.enum(['draft', 'final', 'signed', 'sent']).optional(),
          language: z.enum(['fr', 'en']).optional(),
          pdfBlob: z.string().optional(),
          metadata: z
            .object({
              patientName: z.string().optional(),
              patientId: z.string().optional(),
              modality: z.string().optional(),
              studyDate: z.string().optional(),
              studyDescription: z.string().optional(),
              accessionNumber: z.string().optional(),
              priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).optional(),
            })
            .optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.reportModel.update(input.id, input.value as any);
    }),

  /**
   * Create a new version of a report (amendment)
   */
  createReportVersion: reportProcedure
    .input(
      z.object({
        parentReportId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.reportModel.createVersion(input.parentReportId, input.content);

      return data.id;
    }),

  /**
   * Sign a report
   */
  signReport: reportProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.reportModel.signReport(input.id);
    }),

  /**
   * Mark a report as sent to PACS
   */
  markReportAsSent: reportProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.reportModel.markAsSent(input.id);
    }),

  /**
   * Delete a report
   */
  deleteReport: reportProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.reportModel.delete(input.id);
    }),

  /**
   * Delete all reports
   */
  deleteAllReports: reportProcedure.mutation(async ({ ctx }) => {
    return ctx.reportModel.deleteAll();
  }),
});

export type ReportRouter = typeof reportRouter;
