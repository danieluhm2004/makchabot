import { ReporterOptions } from 'envalid';
import { logger } from './logger';

export const reporter = <T>({ errors }: ReporterOptions<T>) => {
  if (Object.keys(errors).length <= 0) return;
  logger.error('환경 변수를 확인해주세요.');
  Object.entries(errors).forEach(([key, error]) =>
    logger.error(`${key}: ${(<Error>error).message}`),
  );

  process.exit(1);
};
