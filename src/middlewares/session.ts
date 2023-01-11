import { DataSource } from 'typeorm';
import { Session } from '../entities/session';
import { TypeormAdapter } from '@grammyjs/storage-typeorm';
import { logger } from '../tools/logger';
import { session } from 'grammy';

export interface SessionData {
  fromStationId?: string;
  toStationId?: string;
  serviceDay?: number;
}

export const SessionMiddleware = (datasource: DataSource) => {
  const repository = datasource.getRepository(Session);
  const storage = new TypeormAdapter({ repository });
  logger.info('세션 미들웨어를 활성화합니다.');
  return session({ storage, initial: () => ({}) });
};
