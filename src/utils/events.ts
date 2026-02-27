/* Event utilities */

export function stopPropagation(e: { stopPropagation: () => void }) {
  e.stopPropagation();
}

export function preventDefault(e: { preventDefault: () => void }) {
  e.preventDefault();
}

export function mergeHandlers<E>(
  ...handlers: Array<((e: E) => void) | undefined>
) {
  return (e: E) => {
    for (const handler of handlers) {
      handler?.(e);
    }
  };
}

/**
 * Event listener helper - adapted from marimo
 */
export const Events = {
  onKeyDown: (handlers: Record<string, (e: KeyboardEvent) => void>) => {
    return (e: KeyboardEvent) => {
      const handler = handlers[e.key];
      if (handler) handler(e);
    };
  },
  shouldIgnoreKeyboardEvent: (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  },
  stopPropagation,
  preventDefault,
};
