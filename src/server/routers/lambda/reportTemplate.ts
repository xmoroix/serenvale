import { z } from 'zod';

import { ReportTemplateModel } from '@/database/models/reportTemplate';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const reportTemplateProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { reportTemplateModel: new ReportTemplateModel(ctx.serverDB, ctx.userId) },
  });
});

export const reportTemplateRouter = router({
  /**
   * Get all templates available to the user (global + personal)
   */
  getTemplates: reportTemplateProcedure.query(async ({ ctx }) => {
    return ctx.reportTemplateModel.query();
  }),

  /**
   * Get only global templates
   */
  getGlobalTemplates: reportTemplateProcedure.query(async ({ ctx }) => {
    return ctx.reportTemplateModel.queryGlobal();
  }),

  /**
   * Get only personal templates
   */
  getPersonalTemplates: reportTemplateProcedure.query(async ({ ctx }) => {
    return ctx.reportTemplateModel.queryPersonal();
  }),

  /**
   * Get template by ID
   */
  getTemplateById: reportTemplateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.reportTemplateModel.findById(input.id);
    }),

  /**
   * Get templates by modality
   */
  getTemplatesByModality: reportTemplateProcedure
    .input(z.object({ modality: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.reportTemplateModel.findByModality(input.modality);
    }),

  /**
   * Create a new template
   */
  createTemplate: reportTemplateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        modality: z.string().optional(),
        sections: z
          .array(
            z.object({
              title: z.string(),
              content: z.string().optional(),
              order: z.number(),
              required: z.boolean().optional(),
            }),
          )
          .optional(),
        content: z.string().optional(),
        language: z.enum(['fr', 'en']).optional(),
        isGlobal: z.boolean().default(false),
        metadata: z
          .object({
            tags: z.array(z.string()).optional(),
            category: z.string().optional(),
            version: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.reportTemplateModel.create(input);
    }),

  /**
   * Update a template (personal templates only)
   */
  updateTemplate: reportTemplateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        modality: z.string().optional(),
        sections: z
          .array(
            z.object({
              title: z.string(),
              content: z.string().optional(),
              order: z.number(),
              required: z.boolean().optional(),
            }),
          )
          .optional(),
        content: z.string().optional(),
        language: z.enum(['fr', 'en']).optional(),
        metadata: z
          .object({
            tags: z.array(z.string()).optional(),
            category: z.string().optional(),
            version: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...values } = input;
      await ctx.reportTemplateModel.update(id, values);
      return ctx.reportTemplateModel.findById(id);
    }),

  /**
   * Update a global template (admin only - should add admin check)
   */
  updateGlobalTemplate: reportTemplateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        modality: z.string().optional(),
        sections: z
          .array(
            z.object({
              title: z.string(),
              content: z.string().optional(),
              order: z.number(),
              required: z.boolean().optional(),
            }),
          )
          .optional(),
        content: z.string().optional(),
        language: z.enum(['fr', 'en']).optional(),
        metadata: z
          .object({
            tags: z.array(z.string()).optional(),
            category: z.string().optional(),
            version: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Add admin role check here
      const { id, ...values } = input;
      await ctx.reportTemplateModel.updateGlobal(id, values);
      return ctx.reportTemplateModel.findById(id);
    }),

  /**
   * Delete a template (personal templates only)
   */
  deleteTemplate: reportTemplateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.reportTemplateModel.delete(input.id);
      return { success: true };
    }),
});
