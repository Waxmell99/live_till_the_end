import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SAVE_KEY } from './game/constants';
import { LANGUAGE_KEY } from './i18n';

function buttonWithText(root: ParentNode, text: string): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')].find((candidate) => candidate.textContent?.includes(text));
  if (!button) throw new Error(`Button not found: ${text}`);
  return button;
}

describe('browser game flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('moves from the title to a saved playable choice without console errors', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => root.render(<App />));
    expect(container.textContent).toContain('Survive Until');

    await act(async () => buttonWithText(container, 'Begin another life').click());
    expect(container.textContent).toContain('Who were you before the war?');

    await act(async () => buttonWithText(container, 'Report to the front').click());
    expect(container.textContent).toContain('The road ends at the trenches');
    expect(container.textContent).toContain('Thomas Miller');

    await act(async () => {
      buttonWithText(container, 'Introduce yourself to the section').click();
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(container.textContent).toContain('Last entry');
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();

    await act(async () => buttonWithText(container, 'War diary').click());
    expect(container.textContent).toContain('WAR DIARY');
    expect(container.textContent).toContain('The road ends at the trenches');

    await act(async () => root.unmount());
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('switches the complete playable surface to Chinese and remembers the choice', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root = createRoot(container);

    await act(async () => root.render(<App />));
    await act(async () => buttonWithText(container, '中文').click());
    expect(container.textContent).toContain('你无法指挥军队');
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('zh');

    await act(async () => buttonWithText(container, '开始另一段人生').click());
    expect(container.textContent).toContain('战争以前，你是谁？');
    expect([...container.querySelectorAll('input')].some((input) => input.value === '铁路学徒')).toBe(true);

    await act(async () => buttonWithText(container, '前往西线报到').click());
    expect(container.textContent).toContain('道路在战壕前终止');
    expect(container.textContent).toContain('你要怎么做？');

    await act(async () => {
      buttonWithText(container, '向班里的战友自我介绍').click();
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(container.textContent).toContain('上一则记录');
    expect(container.textContent).toContain('五个人在冒烟的火盆旁');

    await act(async () => root.unmount());
    container.innerHTML = '';
    root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(container.textContent).toContain('继续Thomas Miller的人生');
    await act(async () => root.unmount());
  });
});
