import { and, desc, eq } from 'drizzle-orm';

import { NewStudy, studies } from '../schemas';
import { LobeChatDatabase } from '../type';

export class StudyModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Create a new study record
   */
  create = async (params: Omit<NewStudy, 'userId'>) => {
    const [result] = await this.db
      .insert(studies)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  /**
   * Delete a study by ID
   */
  delete = async (id: string) => {
    return this.db
      .delete(studies)
      .where(and(eq(studies.id, id), eq(studies.userId, this.userId)));
  };

  /**
   * Delete all studies for the user
   */
  deleteAll = async () => {
    return this.db.delete(studies).where(eq(studies.userId, this.userId));
  };

  /**
   * Query all studies for the user, ordered by fetch date (newest first)
   */
  query = async () => {
    return this.db.query.studies.findMany({
      orderBy: [desc(studies.fetchedAt)],
      where: eq(studies.userId, this.userId),
    });
  };

  /**
   * Find a study by ID
   */
  findById = async (id: string) => {
    return this.db.query.studies.findFirst({
      where: and(eq(studies.id, id), eq(studies.userId, this.userId)),
    });
  };

  /**
   * Find a study by PACS ID (unique identifier from PACS)
   */
  findByPacsId = async (pacsId: string) => {
    return this.db.query.studies.findFirst({
      where: and(eq(studies.pacsId, pacsId), eq(studies.userId, this.userId)),
    });
  };

  /**
   * Update a study
   */
  update = async (id: string, value: Partial<NewStudy>) => {
    return this.db
      .update(studies)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(studies.id, id), eq(studies.userId, this.userId)));
  };

  /**
   * Find studies by modality
   */
  findByModality = async (modality: string) => {
    return this.db.query.studies.findMany({
      where: and(eq(studies.modality, modality), eq(studies.userId, this.userId)),
      orderBy: [desc(studies.fetchedAt)],
    });
  };

  /**
   * Find studies by priority
   */
  findByPriority = async (priority: 'STAT' | 'URGENT' | 'ROUTINE') => {
    return this.db.query.studies.findMany({
      where: and(eq(studies.priority, priority), eq(studies.userId, this.userId)),
      orderBy: [desc(studies.fetchedAt)],
    });
  };

  /**
   * Query studies with their associated reports
   */
  queryWithReports = async () => {
    return this.db.query.studies.findMany({
      where: eq(studies.userId, this.userId),
      orderBy: [desc(studies.fetchedAt)],
      with: {
        reports: true,
      },
    });
  };
}
