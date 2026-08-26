export type ChoiceTranslation = [label: string, detail: string, outcome: string];

export interface EventTranslation {
  title: string;
  kicker: string;
  text: string[];
  choices: ChoiceTranslation[];
  recap?: string;
  nextHint?: string;
}

export function translatedEvent(
  title: string,
  kicker: string,
  text: string | string[],
  choices: ChoiceTranslation[],
  story?: { recap?: string; nextHint?: string },
): EventTranslation {
  return { title, kicker, text: Array.isArray(text) ? text : [text], choices, ...story };
}
