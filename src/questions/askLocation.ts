import { ChooseDestinationQuestion } from './chooseDestination';
import { MyContext } from '..';
import { ReplyToMessageContext } from '@grammyjs/stateless-question/dist/source/identifier';
import { StatelessQuestion } from '@grammyjs/stateless-question';
import { Station } from '../entities/station';

export const AskLocationQuestion = new StatelessQuestion(
  'AskLocation',
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
      AskLocationQuestion.replyWithMarkdown(
        ctx,
        '지하철역을 찾을 수 없습니다. 다시 입력해주세요.',
      );

      return;
    }

    ctx.session.fromStationId = station.stationId;
    ChooseDestinationQuestion.replyWithMarkdown(
      ctx,
      `${station.name}역에서 출발합니다. 도착지를 지도에서 선택하거나 지하철역 이름을 입력하세요.. (취소하려면 "취소"를 입력해주세요.)`,
    );
  },
);
