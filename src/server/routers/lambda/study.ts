import { z } from 'zod';

import { StudyModel } from '@/database/models/study';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const studyProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { studyModel: new StudyModel(ctx.serverDB, ctx.userId) },
  });
});

export const studyRouter = router({
  /**
   * Create a new study record from PACS query
   */
  createStudy: studyProcedure
    .input(
      z.object({
        pacsId: z.string(),
        metadata: z
          .object({
            patientName: z.string(),
            patientId: z.string(),
            patientBirthDate: z.string().optional(),
            patientSex: z.string().optional(),
            studyDate: z.string(),
            studyTime: z.string().optional(),
            studyDescription: z.string().optional(),
            accessionNumber: z.string().optional(),
            studyInstanceUID: z.string(),
            institutionName: z.string().optional(),
            referringPhysicianName: z.string().optional(),
          })
          .optional(),
        modality: z.string().optional(),
        priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.studyModel.create(input);

      return data.id;
    }),

  /**
   * Get all studies for the user
   */
  getStudies: studyProcedure.query(async ({ ctx }) => {
    return ctx.studyModel.query();
  }),

  /**
   * Get studies with their reports
   */
  getStudiesWithReports: studyProcedure.query(async ({ ctx }) => {
    return ctx.studyModel.queryWithReports();
  }),

  /**
   * Get a study by ID
   */
  getStudy: studyProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.studyModel.findById(input.id);
    }),

  /**
   * Get a study by PACS ID
   */
  getStudyByPacsId: studyProcedure
    .input(z.object({ pacsId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.studyModel.findByPacsId(input.pacsId);
    }),

  /**
   * Get studies by modality
   */
  getStudiesByModality: studyProcedure
    .input(z.object({ modality: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.studyModel.findByModality(input.modality);
    }),

  /**
   * Get studies by priority
   */
  getStudiesByPriority: studyProcedure
    .input(z.object({ priority: z.enum(['STAT', 'URGENT', 'ROUTINE']) }))
    .query(async ({ input, ctx }) => {
      return ctx.studyModel.findByPriority(input.priority);
    }),

  /**
   * Update a study
   */
  updateStudy: studyProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({
          metadata: z.any().optional(),
          modality: z.string().optional(),
          priority: z.enum(['STAT', 'URGENT', 'ROUTINE']).optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.studyModel.update(input.id, input.value);
    }),

  /**
   * Delete a study
   */
  deleteStudy: studyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.studyModel.delete(input.id);
    }),

  /**
   * Delete all studies
   */
  deleteAllStudies: studyProcedure.mutation(async ({ ctx }) => {
    return ctx.studyModel.deleteAll();
  }),
});

export type StudyRouter = typeof studyRouter;
