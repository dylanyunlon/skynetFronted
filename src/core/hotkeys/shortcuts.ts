/* Hotkeys shortcuts stub - adapted from marimo */

export interface Shortcut {
  key: string;
  name: string;
}

export const HOTKEYS = {
  "cell.run": { key: "Shift-Enter", name: "Run cell" },
  "cell.runAndNewBelow": { key: "Mod-Enter", name: "Run and add below" },
  "global.save": { key: "Mod-s", name: "Save" },
  "global.commandPalette": { key: "Mod-k", name: "Command palette" },
} as const;

export function prettyPrintShortcut(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  return shortcut
    .replace("Mod", isMac ? "⌘" : "Ctrl")
    .replace("Shift", isMac ? "⇧" : "Shift")
    .replace("Alt", isMac ? "⌥" : "Alt")
    .replace("-", "+");
}

export function parseShortcut(shortcut: string): { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } {
  const parts = shortcut.split("-");
  const key = parts[parts.length - 1];
  return {
    key,
    ctrlKey: parts.includes("Ctrl"),
    shiftKey: parts.includes("Shift"),
    altKey: parts.includes("Alt"),
    metaKey: parts.includes("Mod") || parts.includes("Meta"),
  };
}
