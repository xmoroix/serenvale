import { eq } from 'drizzle-orm';

import { clinicConfig, NewClinicConfig } from '../schemas';
import { LobeChatDatabase } from '../type';

export class ClinicConfigModel {
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  /**
   * Get the clinic configuration
   * There should only be one clinic config per installation
   */
  get = async () => {
    return this.db.query.clinicConfig.findFirst();
  };

  /**
   * Create clinic configuration
   * Should be called once during initial setup
   */
  create = async (params: Omit<NewClinicConfig, 'id'>) => {
    const [result] = await this.db.insert(clinicConfig).values(params).returning();

    return result;
  };

  /**
   * Update clinic configuration
   */
  update = async (id: string, value: Partial<NewClinicConfig>) => {
    return this.db
      .update(clinicConfig)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(clinicConfig.id, id));
  };

  /**
   * Update PACS configuration specifically
   */
  updatePacsConfig = async (
    id: string,
    pacsConfig: {
      host: string;
      port: number;
      aeTitle: string;
      queryNode?: string;
      storeNode?: string;
      username?: string;
      password?: string;
    },
  ) => {
    return this.db
      .update(clinicConfig)
      .set({ pacsConfig, updatedAt: new Date() })
      .where(eq(clinicConfig.id, id));
  };

  /**
   * Get PACS configuration
   */
  getPacsConfig = async () => {
    const config = await this.get();
    return config?.pacsConfig;
  };

  /**
   * Get or create clinic config
   * Ensures there's always a config available
   */
  getOrCreate = async (defaultValues?: Partial<NewClinicConfig>) => {
    let config = await this.get();

    if (!config) {
      config = await this.create({
        name: defaultValues?.name || 'Serenvale Clinic',
        pacsConfig: defaultValues?.pacsConfig || {
          host: 'localhost',
          port: 11112,
          aeTitle: 'SERENVALE',
        },
        ...defaultValues,
      });
    }

    return config;
  };
}
