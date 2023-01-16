import { cleanEnv, host, port, str } from 'envalid';
import { Bot, Context, SessionFlavor } from 'grammy';
import { DataSource, LessThan } from 'typeorm';
import { SessionData, SessionMiddleware } from './middlewares/session';

import dayjs from 'dayjs';
import { scheduleJob } from 'node-schedule';
import { onMakchaCommand } from './commands/makcha';
import { Schedule } from './entities/schedule';
import { Session } from './entities/session';
import { Station } from './entities/station';
import { QuestionMiddleware } from './questions';
import { logger } from './tools/logger';
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

  scheduleJob('* * * * *', async () => {
    const schedules = await Schedule.find({
      where: {
        isAlerted: false,
        alertedAt: LessThan(dayjs().add(15, 'minutes').toDate()),
      },
    });

    for (const schedule of schedules) {
      await bot.api.sendMessage(
        schedule.chatId,
        `[${schedule.username}](tg://user?id=${
          schedule.userId
        })님! 지하철 막차가 15분 남았습니다. (${dayjs(
          schedule.alertedAt,
        ).format('HH시 mm분')})`,
        { parse_mode: 'Markdown' },
      );

      schedule.isAlerted = true;
      await schedule.save();
    }
  });

  await bot.start();
}

main();
