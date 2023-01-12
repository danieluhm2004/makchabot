import { AskLocationQuestion } from './askLocation';
import { AskServiceDayQuestion } from './askServiceDay';
import { ChooseDestinationQuestion } from './chooseDestination';

export function QuestionMiddleware() {
  return [
    AskLocationQuestion.middleware(),
    ChooseDestinationQuestion.middleware(),
    AskServiceDayQuestion.middleware(),
  ];
}
