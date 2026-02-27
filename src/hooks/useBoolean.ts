/* useBoolean hook */
import { useState, useCallback, useMemo } from "react";

interface UseBooleanReturn {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  setValue: (value: boolean) => void;
}

export function useBoolean(initialValue = false): UseBooleanReturn {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);

  return useMemo(
    () => ({ value, setTrue, setFalse, toggle, setValue }),
    [value, setTrue, setFalse, toggle]
  );
}
