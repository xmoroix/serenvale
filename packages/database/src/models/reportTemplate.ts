import { and, desc, eq, or } from 'drizzle-orm';

import { NewReportTemplate, reportTemplates } from '../schemas';
import { LobeChatDatabase } from '../type';

export class ReportTemplateModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Create a new report template
   */
  create = async (params: Omit<NewReportTemplate, 'userId'>) => {
    const [result] = await this.db
      .insert(reportTemplates)
      .values({
        ...params,
        userId: params.isGlobal ? null : this.userId,
      })
      .returning();

    return result;
  };

  /**
   * Delete a template by ID
   * Only allows deleting own templates or if user is admin
   */
  delete = async (id: string) => {
    return this.db
      .delete(reportTemplates)
      .where(and(eq(reportTemplates.id, id), eq(reportTemplates.userId, this.userId)));
  };

  /**
   * Query all templates available to the user
   * Returns both global templates and user's personal templates
   */
  query = async () => {
    return this.db.query.reportTemplates.findMany({
      orderBy: [desc(reportTemplates.createdAt)],
      where: or(
        eq(reportTemplates.isGlobal, true), // Global templates
        eq(reportTemplates.userId, this.userId), // User's personal templates
      ),
    });
  };

  /**
   * Query only global templates
   */
  queryGlobal = async () => {
    return this.db.query.reportTemplates.findMany({
      orderBy: [desc(reportTemplates.createdAt)],
      where: eq(reportTemplates.isGlobal, true),
    });
  };

  /**
   * Query only user's personal templates
   */
  queryPersonal = async () => {
    return this.db.query.reportTemplates.findMany({
      orderBy: [desc(reportTemplates.createdAt)],
      where: and(eq(reportTemplates.userId, this.userId), eq(reportTemplates.isGlobal, false)),
    });
  };

  /**
   * Find a template by ID
   * Only returns if template is global or belongs to user
   */
  findById = async (id: string) => {
    return this.db.query.reportTemplates.findFirst({
      where: and(
        eq(reportTemplates.id, id),
        or(eq(reportTemplates.isGlobal, true), eq(reportTemplates.userId, this.userId)),
      ),
    });
  };

  /**
   * Find templates by modality
   */
  findByModality = async (modality: string) => {
    return this.db.query.reportTemplates.findMany({
      where: and(
        eq(reportTemplates.modality, modality),
        or(eq(reportTemplates.isGlobal, true), eq(reportTemplates.userId, this.userId)),
      ),
      orderBy: [desc(reportTemplates.createdAt)],
    });
  };

  /**
   * Update a template
   * Only allows updating own templates
   */
  update = async (id: string, value: Partial<NewReportTemplate>) => {
    return this.db
      .update(reportTemplates)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(reportTemplates.id, id), eq(reportTemplates.userId, this.userId)));
  };

  /**
   * Update a global template (admin only - no userId check)
   */
  updateGlobal = async (id: string, value: Partial<NewReportTemplate>) => {
    return this.db
      .update(reportTemplates)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(reportTemplates.id, id), eq(reportTemplates.isGlobal, true)));
  };
}
