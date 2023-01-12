import { AskServiceDayQuestion } from './askServiceDay';
import { MyContext } from '..';
import { ReplyToMessageContext } from '@grammyjs/stateless-question/dist/source/identifier';
import { StatelessQuestion } from '@grammyjs/stateless-question';
import { Station } from '../entities/station';

export const ChooseDestinationQuestion = new StatelessQuestion(
  'ChooseDestination',
  async (ctx: ReplyToMessageContext<MyContext>) => {
    let station: Station | null = null;
    if (ctx.message.location) {
      const { latitude, longitude } = ctx.message.location;
      const orderBy =
        '((latitude-:latitude)*(latitude-:latitude))+((longitude-:longitude)*(longitude-:longitude))';
      station = await Station.createQueryBuilder()
        .orderBy(orderBy, 'ASC')
        .setParameters({ latitude, longitude })
        .getOneOrFail();
    } else if (ctx.message.text) {
      const { text } = ctx.message;
      if (text === '취소') {
        ctx.session = {};
        ctx.reply('취소되었습니다.');
        return;
      }

      station = await Station.findOne({
        where: { name: text.replace('역', '') },
      });
    }

    if (!station) {
      ChooseDestinationQuestion.replyWithMarkdown(
        ctx,
        '지하철역을 찾을 수 없습니다. 다시 입력해주세요.',
      );

      return;
    }

    if (ctx.session.fromStationId === station.stationId) {
      ChooseDestinationQuestion.replyWithMarkdown(
        ctx,
        '출발지와 도착지가 같습니다. 다시 입력해주세요.',
      );

      return;
    }

    ctx.session.toStationId = station.stationId;
    await AskServiceDayQuestion.replyWithMarkdown(
      ctx,
      '목적지를 선택하였습니다. 서비스 요일을 선택해주세요. (평일, 토요일, 공휴일)',
    );
  },
);
