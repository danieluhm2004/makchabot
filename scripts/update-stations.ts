import 'reflect-metadata';

import { cleanEnv, host, port, str } from 'envalid';

import { DataSource } from 'typeorm';
import { Station } from '../src/entities/station';
import _ from 'lodash';
import axios from 'axios';
import { logger } from '../src/tools/logger';
import { reporter } from '../src/tools/reporter';

async function main() {
  const version = '6.34';
  const env = cleanEnv(
    process.env,
    {
      MYSQL_HOST: host({ desc: 'MySQL 호스트를 입력해주세요.' }),
      MYSQL_PORT: port({ default: 3306 }),
      MYSQL_USERNAME: str({ desc: 'MySQL 사용자명을 입력해주세요.' }),
      MYSQL_PASSWORD: str({ desc: 'MySQL 비밀번호를 입력해주세요.' }),
      MYSQL_DATABASE: str({ desc: 'MySQL 데이터베이스명을 입력해주세요.' }),
    },
    { reporter },
  );

  logger.info('데이터베이스를 설정하고 있습니다.');
  const datasource = new DataSource({
    type: 'mysql',
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    username: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    entities: [Station],
    synchronize: true,
  });

  await datasource.initialize();

  logger.info('지하철 역 정보를 가져오고 있습니다.');
  const url = 'https://map.naver.com/v5/api/subway/provide';
  const { data } = await axios.get(url, {
    params: {
      version,
      readPath: 1000,
      language: 'ko',
      requestFile: 'metaData.json',
      caller: 'NaverMapPcBetaWeb',
    },
  });

  const station = datasource.getRepository(Station);
  const stations = _.uniqBy(
    data[0].realInfo.map(({ id, name, latitude, longitude }: any) => ({
      stationId: id,
      name,
      latitude,
      longitude,
    })),
    'name',
  );

  logger.info('지하철 역 정보를 초기화합니다.');
  await station.clear();

  logger.info(`지하철 역 정보를 업데이트하고 있습니다. (${stations.length}개)`);
  await station.insert(stations as any);

  logger.info('지하철 역 정보를 업데이트했습니다.');
  process.exit(0);
}

main();
