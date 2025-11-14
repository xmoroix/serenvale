import { and, desc, eq } from 'drizzle-orm';

import { NewReport, reports } from '../schemas';
import { LobeChatDatabase } from '../type';

export class ReportModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Create a new report
   */
  create = async (params: Omit<NewReport, 'userId'>) => {
    const [result] = await this.db
      .insert(reports)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  /**
   * Delete a report by ID
   */
  delete = async (id: string) => {
    return this.db
      .delete(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, this.userId)));
  };

  /**
   * Delete all reports for the user
   */
  deleteAll = async () => {
    return this.db.delete(reports).where(eq(reports.userId, this.userId));
  };

  /**
   * Query all reports for the user, ordered by creation date (newest first)
   */
  query = async () => {
    return this.db.query.reports.findMany({
      orderBy: [desc(reports.createdAt)],
      where: eq(reports.userId, this.userId),
    });
  };

  /**
   * Find a report by ID
   */
  findById = async (id: string) => {
    return this.db.query.reports.findFirst({
      where: and(eq(reports.id, id), eq(reports.userId, this.userId)),
    });
  };

  /**
   * Find reports by study ID
   */
  findByStudyId = async (studyId: string) => {
    return this.db.query.reports.findMany({
      where: and(eq(reports.studyId, studyId), eq(reports.userId, this.userId)),
      orderBy: [desc(reports.version)],
    });
  };

  /**
   * Find the latest report for a study
   */
  findLatestByStudyId = async (studyId: string) => {
    return this.db.query.reports.findFirst({
      where: and(eq(reports.studyId, studyId), eq(reports.userId, this.userId)),
      orderBy: [desc(reports.version)],
    });
  };

  /**
   * Update a report
   */
  update = async (id: string, value: Partial<NewReport>) => {
    return this.db
      .update(reports)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(reports.id, id), eq(reports.userId, this.userId)));
  };

  /**
   * Find reports by status
   */
  findByStatus = async (status: 'draft' | 'final' | 'signed' | 'sent') => {
    return this.db.query.reports.findMany({
      where: and(eq(reports.status, status), eq(reports.userId, this.userId)),
      orderBy: [desc(reports.createdAt)],
    });
  };

  /**
   * Find draft reports
   */
  findDrafts = async () => {
    return this.findByStatus('draft');
  };

  /**
   * Find final/signed reports (completed reports)
   */
  findCompleted = async () => {
    return this.db.query.reports.findMany({
      where: and(
        eq(reports.userId, this.userId),
        // Status is either 'final', 'signed', or 'sent'
      ),
      orderBy: [desc(reports.createdAt)],
    });
  };

  /**
   * Query reports with their associated study
   */
  queryWithStudy = async () => {
    return this.db.query.reports.findMany({
      where: eq(reports.userId, this.userId),
      orderBy: [desc(reports.createdAt)],
      with: {
        study: true,
      },
    });
  };

  /**
   * Create a new version of a report (for amendments)
   */
  createVersion = async (parentReportId: string, content: string) => {
    // Find the parent report to get study ID and increment version
    const parentReport = await this.findById(parentReportId);
    if (!parentReport) {
      throw new Error('Parent report not found');
    }

    const [result] = await this.db
      .insert(reports)
      .values({
        studyId: parentReport.studyId,
        content,
        version: parentReport.version + 1,
        parentId: parentReportId,
        status: 'draft',
        language: parentReport.language,
        agentId: parentReport.agentId,
        userId: this.userId,
      })
      .returning();

    return result;
  };

  /**
   * Mark a report as signed
   */
  signReport = async (id: string) => {
    return this.db
      .update(reports)
      .set({
        status: 'signed',
        signedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(reports.id, id), eq(reports.userId, this.userId)));
  };

  /**
   * Mark a report as sent to PACS
   */
  markAsSent = async (id: string) => {
    return this.db
      .update(reports)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(reports.id, id), eq(reports.userId, this.userId)));
  };
}
