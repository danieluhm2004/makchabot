import { Bot, Context, SessionFlavor } from 'grammy';
import { SessionData, SessionMiddleware } from './middlewares/session';
import { cleanEnv, host, port, str } from 'envalid';

import { DataSource } from 'typeorm';
import { QuestionMiddleware } from './questions';
import { Schedule } from './entities/schedule';
import { Session } from './entities/session';
import { Station } from './entities/station';
import { logger } from './tools/logger';
import { onMakchaCommand } from './commands/makcha';
import { reporter } from './tools/reporter';

export type MyContext = Context & SessionFlavor<SessionData>;

async function main() {
  const env = cleanEnv(
    process.env,
    {
      TELEGRAM_BOT_TOKEN: str({ desc: '텔레그램 봇 토큰을 입력해주세요.' }),
      MYSQL_HOST: host({ desc: 'MySQL 호스트를 입력해주세요.' }),
      MYSQL_PORT: port({ default: 3306 }),
      MYSQL_USERNAME: str({ desc: 'MySQL 사용자명을 입력해주세요.' }),
      MYSQL_PASSWORD: str({ desc: 'MySQL 비밀번호를 입력해주세요.' }),
      MYSQL_DATABASE: str({ desc: 'MySQL 데이터베이스명을 입력해주세요.' }),
    },
    { reporter },
  );

  logger.info('텔레그램 봇을 설정하고 있습니다.');
  const bot = new Bot<MyContext>(env.TELEGRAM_BOT_TOKEN);

  logger.info('데이터베이스를 설정하고 있습니다.');
  const datasource = new DataSource({
    type: 'mysql',
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    username: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    entities: [Session, Station, Schedule],
    synchronize: true,
  });

  await datasource.initialize();

  bot.use(SessionMiddleware(datasource));
  bot.use(...QuestionMiddleware());
  bot.command('makcha', onMakchaCommand);
  logger.info('텔레그램 봇을 시작합니다.');
  await bot.start();
}

main();
