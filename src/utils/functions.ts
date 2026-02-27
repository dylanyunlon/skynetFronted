/* Function utilities */

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {};

export function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: unknown[]) => {
    if (!called) {
      called = true;
      result = fn(...args) as ReturnType<T>;
    }
    return result;
  }) as T;
}

export const Functions = {
  NOOP,
  once,
  asUpdater: <T>(value: T) => () => value,
};
