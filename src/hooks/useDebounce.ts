/* useDebounce hook */
import { useEffect, useState, useCallback, useRef } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => callback(...args), delay));
  };
}

/**
 * useDebounceControlledState - for controlled inputs with debounced onChange
 */
export function useDebounceControlledState<T>(opts: {
  value?: T;
  initialValue?: T;
  onChange?: (value: T) => void;
  delay?: number;
}): { value: T; onChange: (value: T) => void } {
  const { value: valueProp, initialValue, onChange, delay = 200 } = opts;
  const initialVal = (valueProp ?? initialValue) as T;
  const [localValue, setLocalValue] = useState<T>(initialVal);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (valueProp !== undefined) {
      setLocalValue(valueProp);
    }
  }, [valueProp]);

  const handleChange = useCallback(
    (newValue: T) => {
      setLocalValue(newValue);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange?.(newValue);
      }, delay);
    },
    [onChange, delay]
  );

  return { value: localValue, onChange: handleChange };
}
