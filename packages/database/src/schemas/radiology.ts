/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { index, integer, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '../utils/idGenerator';
import { timestamps, timestamptz } from './_helpers';
import { users } from './user';

/**
 * PACS Studies table
 * Stores metadata from PACS C-FIND queries
 */
export const studies = pgTable(
  'studies',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('studies'))
      .primaryKey(),

    // DICOM Study Instance UID
    pacsId: text('pacs_id').notNull().unique(),

    // DICOM metadata (PatientName, StudyDate, StudyDescription, etc.)
    metadata: jsonb('metadata').$type<{
      patientName?: string;
      patientId?: string;
      studyDate?: string;
      studyTime?: string;
      studyDescription?: string;
      accessionNumber?: string;
      referringPhysician?: string;
      institutionName?: string;
      studyInstanceUID?: string;
      seriesCount?: number;
      imageCount?: number;
    }>(),

    // Modality type (IRM, TDM, RAD, ECHO, etc.)
    modality: varchar('modality', { length: 50 }),

    // Priority level for the study
    priority: varchar('priority', { length: 20 }).$type<'STAT' | 'URGENT' | 'ROUTINE'>(),

    // When this study was fetched from PACS
    fetchedAt: timestamptz('fetched_at').notNull().defaultNow(),

    // User who queried this study
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    ...timestamps,
  },
  (t) => ({
    pacsIdIdx: index('studies_pacs_id_idx').on(t.pacsId),
    userIdIdx: index('studies_user_id_idx').on(t.userId),
    modalityIdx: index('studies_modality_idx').on(t.modality),
    priorityIdx: index('studies_priority_idx').on(t.priority),
  }),
);

export const insertStudySchema = createInsertSchema(studies);

export type NewStudy = typeof studies.$inferInsert;
export type StudyItem = typeof studies.$inferSelect;

/**
 * Radiology Reports table
 * Stores generated reports with versioning support
 */
export const reports = pgTable(
  'reports',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('reports'))
      .primaryKey(),

    // Reference to the PACS study
    studyId: text('study_id').references(() => studies.id, { onDelete: 'set null' }),

    // Version number for tracking edits
    version: integer('version').notNull().default(1),

    // Parent report ID for version history
    parentId: text('parent_id').references((): any => reports.id, { onDelete: 'set null' }),

    // Report content (plain text or structured)
    content: text('content').notNull(),

    // Report status workflow
    status: varchar('status', { length: 20 })
      .$type<'draft' | 'final' | 'signed' | 'sent'>()
      .notNull()
      .default('draft'),

    // Language of the report
    language: varchar('language', { length: 10 }).$type<'fr' | 'en'>().notNull().default('fr'),

    // Agent used to generate the report
    agentId: text('agent_id'),

    // Generated PDF (base64 or file path)
    pdfBlob: text('pdf_blob'),

    // Additional metadata
    metadata: jsonb('metadata').$type<{
      template?: string;
      modelUsed?: string;
      generationTime?: number;
      wordCount?: number;
      findings?: string[];
      impression?: string;
      recommendations?: string[];
    }>(),

    // Timestamps for workflow
    signedAt: timestamptz('signed_at'),
    sentAt: timestamptz('sent_at'),

    // User who created this report
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    ...timestamps,
  },
  (t) => ({
    studyIdIdx: index('reports_study_id_idx').on(t.studyId),
    userIdIdx: index('reports_user_id_idx').on(t.userId),
    statusIdx: index('reports_status_idx').on(t.status),
    parentIdIdx: index('reports_parent_id_idx').on(t.parentId),
  }),
);

export const insertReportSchema = createInsertSchema(reports);

export type NewReport = typeof reports.$inferInsert;
export type ReportItem = typeof reports.$inferSelect;
