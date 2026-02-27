/* Number utilities */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function prettyNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function prettyScientificNumber(value: number): string {
  if (Math.abs(value) < 0.001 || Math.abs(value) > 1e6) {
    return value.toExponential(2);
  }
  return prettyNumber(value);
}

export function maxFractionalDigits(step: number): number {
  const str = String(step);
  const dotIndex = str.indexOf(".");
  if (dotIndex === -1) return 0;
  return str.length - dotIndex - 1;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}
