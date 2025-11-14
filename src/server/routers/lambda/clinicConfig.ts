import { z } from 'zod';

import { ClinicConfigModel } from '@/database/models/clinicConfig';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

// Clinic config procedures don't need userId since config is global
const clinicConfigProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { clinicConfigModel: new ClinicConfigModel(ctx.serverDB) },
  });
});

// Public procedure for getting clinic config (needed for unauthenticated pages like login)
const publicClinicConfigProcedure = publicProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { clinicConfigModel: new ClinicConfigModel(ctx.serverDB) },
  });
});

export const clinicConfigRouter = router({
  /**
   * Get clinic configuration (public endpoint for logo, name in login page)
   */
  getClinicConfig: publicClinicConfigProcedure.query(async ({ ctx }) => {
    return ctx.clinicConfigModel.get();
  }),

  /**
   * Get clinic configuration (authenticated)
   */
  getConfig: clinicConfigProcedure.query(async ({ ctx }) => {
    return ctx.clinicConfigModel.get();
  }),

  /**
   * Get or create clinic configuration
   */
  getOrCreateConfig: clinicConfigProcedure.query(async ({ ctx }) => {
    return ctx.clinicConfigModel.getOrCreate();
  }),

  /**
   * Update clinic configuration
   */
  updateConfig: clinicConfigProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        logo: z.string().optional(),
        director: z.string().optional(),
        accreditation: z.string().optional(),
        settings: z
          .object({
            defaultLanguage: z.enum(['fr', 'en']).optional(),
            timezone: z.string().optional(),
            reportNumberPrefix: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...values } = input;
      await ctx.clinicConfigModel.update(id, values);
      return ctx.clinicConfigModel.get();
    }),

  /**
   * Get PACS configuration
   */
  getPacsConfig: clinicConfigProcedure.query(async ({ ctx }) => {
    return ctx.clinicConfigModel.getPacsConfig();
  }),

  /**
   * Update PACS configuration
   */
  updatePacsConfig: clinicConfigProcedure
    .input(
      z.object({
        id: z.string(),
        host: z.string(),
        port: z.number(),
        aeTitle: z.string(),
        queryNode: z.string().optional(),
        storeNode: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...pacsConfig } = input;
      await ctx.clinicConfigModel.updatePacsConfig(id, pacsConfig);
      return ctx.clinicConfigModel.get();
    }),

  /**
   * Create clinic configuration (initial setup)
   */
  createConfig: clinicConfigProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        logo: z.string().optional(),
        director: z.string().optional(),
        accreditation: z.string().optional(),
        pacsConfig: z
          .object({
            host: z.string(),
            port: z.number(),
            aeTitle: z.string(),
            queryNode: z.string().optional(),
            storeNode: z.string().optional(),
            username: z.string().optional(),
            password: z.string().optional(),
          })
          .optional(),
        settings: z
          .object({
            defaultLanguage: z.enum(['fr', 'en']).optional(),
            timezone: z.string().optional(),
            reportNumberPrefix: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.clinicConfigModel.create(input);
    }),
});
