import { CommandMiddleware, Context } from 'grammy';

import { AskLocationQuestion } from '../questions/askLocation';

export const onMakchaCommand: CommandMiddleware<Context> = async (ctx) => {
  const question =
    '현재 위치를 공유하거나, 지하철역 이름을 입력해주세요. (취소하려면 "취소"를 입력해주세요.)';
  await AskLocationQuestion.replyWithMarkdown(ctx, question);
};
