/* String utilities */

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}

export const Strings = {
  capitalize,
  truncate,
  pluralize,
  startsWith: (str: string, prefix: string) => str.startsWith(prefix),
  includes: (str: string, search: string) => str.toLowerCase().includes(search.toLowerCase()),
  htmlEscape: (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
};
