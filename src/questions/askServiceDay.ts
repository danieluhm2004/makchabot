import { StatelessQuestion } from '@grammyjs/stateless-question';
import { ReplyToMessageContext } from '@grammyjs/stateless-question/dist/source/identifier';
import axios from 'axios';
import dayjs from 'dayjs';
import { MyContext } from '..';
import { Schedule } from '../entities/schedule';

export const AskServiceDayQuestion = new StatelessQuestion(
  'AskServiceDay',
  async (ctx: ReplyToMessageContext<MyContext>) => {
    const serviceDay = ['평일', '토요일', '공휴일'];
    const { text } = ctx.message;
    if (!text || !serviceDay.includes(text)) {
      await AskServiceDayQuestion.replyWithMarkdown(
        ctx,
        '올바른 서비스 요일을 선택해주세요. (평일, 토요일 공휴일)',
      );

      return;
    }

    ctx.session.serviceDay = serviceDay.indexOf(text);
    await ctx.reply('잠시만 기다려주세요. 막차시간 정보를 불러오고 있습니다.');

    const { data } = await axios.get(
      'https://map.naver.com/v5/api/transit/directions/subway',
      {
        params: {
          start: ctx.session.fromStationId,
          goal: ctx.session.toStationId,
          serviceDay: ctx.session.serviceDay,
          departureTime: new Date(),
          option: 'last',
        },
      },
    );

    ctx.session = {};
    const lastTime = data.paths[0].departureTime;
    await ctx.reply(
      `막차는 ${dayjs(lastTime).format(
        'HH:mm',
      )}시입니다. 출발 15분 전 알려드립니다.`,
    );

    await Schedule.create({
      chatId: ctx.message.chat.id,
      userId: (await ctx.getAuthor()).user.id,
      username: await (await ctx.getAuthor()).user.username,
      isAlerted: false,
      alertedAt: lastTime,
    }).save();
  },
);
