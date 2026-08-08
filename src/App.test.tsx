import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SAVE_KEY } from './game/constants';

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
});
