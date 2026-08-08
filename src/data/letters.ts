import type { LetterDefinition } from '../game/types';

export const LETTERS: LetterDefinition[] = [
  {
    id: 'mother-kitchen',
    from: 'Mother',
    subject: 'The kitchen window',
    body: ['My dear {firstName},', 'The rain came under the kitchen window again. Your father says he has fixed it, which means I shall put a towel there myself.', 'We are all well. I wish you would say more than “do not worry.” Of course I worry. Write when you can.', 'With all my love, Mother'],
    replyOptions: [
      { id: 'honest', label: 'Tell her a little of the truth', tone: 'You describe the rain, but not the shelling.', effects: { morale: 5, stress: -3 } },
      { id: 'reassure', label: 'Say that you are quite safe', tone: 'The lie is kind and difficult.', effects: { morale: 2, stress: 2 } },
      { id: 'memory', label: 'Ask about home', tone: 'You fill the page with small questions.', effects: { morale: 7, stress: -1 } },
    ],
  },
  {
    id: 'father-railway',
    from: 'Father',
    subject: 'News from the railway',
    body: ['Son,', 'They have put me on the late goods train again. The yard is short-handed, but no one complains where your mother can hear.', 'Your old foreman asked after you. Keep your feet dry if there is any way to do it.', 'Dad'],
    replyOptions: [
      { id: 'work', label: 'Write about returning to work', tone: 'You make plans you are afraid to trust.', effects: { morale: 6, stress: -2 } },
      { id: 'brief', label: 'Send a brief reply', tone: 'There is not much paper and less privacy.', effects: { morale: 2 } },
    ],
  },
  {
    id: 'sister-dance',
    from: 'Your sister, Elsie',
    subject: 'The church hall dance',
    body: ['Dear {firstName},', 'I went to the church hall dance with May. Before you make a face, Mr. Collins was there and everything was respectable.', 'Your photograph is still on the mantel. Come back before Mother wears it away dusting it.', 'Elsie'],
    replyOptions: [
      { id: 'tease', label: 'Tease Elsie about the dance', tone: 'For ten minutes your handwriting sounds like home.', effects: { morale: 8, stress: -3 } },
      { id: 'protective', label: 'Offer brotherly advice', tone: 'You become very serious and then cross half of it out.', effects: { morale: 4 } },
    ],
  },
  {
    id: 'aunt-parcel',
    from: 'Aunt Margaret',
    subject: 'A parcel sent',
    body: ['Dear boy,', 'I posted a cake, two pairs of socks, and tobacco on Thursday. The clerk could not promise when they would arrive.', 'Mrs. Pritchard’s eldest is home wounded. We do not ask questions.', 'Your affectionate Aunt Margaret'],
    replyOptions: [
      { id: 'thanks', label: 'Write a careful thank-you', tone: 'You thank her before the parcel has found you.', effects: { morale: 5, fatigue: -2 } },
      { id: 'share', label: 'Promise to share the parcel', tone: 'The men approve of this promise.', effects: { morale: 3 } },
    ],
  },
  {
    id: 'old-friend',
    from: 'Daniel Price',
    subject: 'Saturday football',
    body: ['Tommy,', 'We had nine men for football last Saturday and used two schoolboys to make up the sides. It was a disgraceful match.', 'Your name still comes up whenever someone misses an open goal.', 'Dan'],
    replyOptions: [
      { id: 'boast', label: 'Correct his version of events', tone: 'You defend your football honour at length.', effects: { morale: 7, stress: -2 } },
      { id: 'future', label: 'Arrange a match after the war', tone: 'You write “after” twice.', effects: { morale: 6, stress: 1 } },
    ],
  },
  {
    id: 'christmas',
    from: 'The family',
    subject: 'Christmas wishes',
    body: ['Our dear {firstName},', 'There is a place set for you in all but name. We saved a little sugar for the pudding and drank to your health.', 'May the coming year bring you home.', 'All of us'],
    replyOptions: [
      { id: 'hope', label: 'Write hopefully', tone: 'You borrow confidence from the page.', effects: { morale: 9, stress: -2 } },
      { id: 'plain', label: 'Write plainly', tone: 'You say you miss them. Nothing more is needed.', effects: { morale: 5, stress: -5 } },
    ],
  },
  {
    id: 'neighbour-casualty',
    from: 'Mother',
    subject: 'News of the Harris family',
    body: ['My dear {firstName},', 'Young Peter Harris has been killed. His mother asked whether you had ever seen him in France. I told her France is larger than people at home imagine.', 'You need not answer that question. Just write to us.', 'Mother'],
    replyOptions: [
      { id: 'comfort', label: 'Send words for Mrs Harris', tone: 'Every sentence feels inadequate.', effects: { morale: 2, stress: 4 } },
      { id: 'silence', label: 'Write only that you are alive', tone: 'You cannot find another honest sentence.', effects: { morale: -1, stress: 2 } },
    ],
  },
  {
    id: 'spring-garden',
    from: 'Mother',
    subject: 'Daffodils',
    body: ['Dear {firstName},', 'The daffodils are early this year. Your father cut three and left them in a jam jar as though nobody would know it was him.', 'I hope there are signs of spring where you are.', 'Mother'],
    replyOptions: [
      { id: 'describe', label: 'Describe one patch of green', tone: 'You leave the mud outside the letter.', effects: { morale: 7, stress: -3 } },
      { id: 'keep', label: 'Fold the letter away unanswered', tone: 'You read it once more before lights out.', effects: { morale: 3 } },
    ],
  },
  {
    id: 'armistice-rumour',
    from: 'Elsie',
    subject: 'Everyone says it may end',
    body: ['Dear {firstName},', 'People here say the war cannot last much longer. I know you dislike rumours, but hope has got into every conversation.', 'Do not take a foolish chance because of it. Come home in your own time.', 'Elsie'],
    replyOptions: [
      { id: 'promise', label: 'Promise to be careful', tone: 'It is a promise made against forces larger than either of you.', effects: { morale: 8, stress: -2 } },
      { id: 'no-rumours', label: 'Say not to trust rumours', tone: 'You sound stern because hope is frightening.', effects: { morale: 3, stress: 3 } },
    ],
  },
  {
    id: 'blank-paper',
    from: 'Mother',
    subject: 'A page for whatever you can say',
    body: ['My dear {firstName},', 'You do not have to tell us where you are or what has happened. Fill this page with ordinary things if you can.', 'Your room is as you left it.', 'With love, Mother'],
    replyOptions: [
      { id: 'ordinary', label: 'Write about tea and boots', tone: 'The ordinary details steady your hand.', effects: { morale: 6, stress: -5 } },
      { id: 'truth', label: 'Admit that you are tired', tone: 'You stop pretending for one line.', effects: { morale: 4, stress: -7 } },
    ],
  },
];

export function letterById(id: string): LetterDefinition {
  const letter = LETTERS.find((candidate) => candidate.id === id);
  if (!letter) throw new Error(`Unknown letter: ${id}`);
  return letter;
}
