/* Copyright 2026 SkyNet. Adapted from marimo. */

import type { ChartConfig } from "./charts";

const STORAGE_KEY = "skynet-chart-configs";

export function hasChart(tableId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const configs = JSON.parse(stored);
    return !!configs[tableId];
  } catch {
    return false;
  }
}

export function getChartConfig(tableId: string): ChartConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const configs = JSON.parse(stored);
    return configs[tableId] || null;
  } catch {
    return null;
  }
}

export function saveChartConfig(tableId: string, config: ChartConfig) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const configs = stored ? JSON.parse(stored) : {};
    configs[tableId] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // ignore storage errors
  }
}

export function removeChartConfig(tableId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const configs = JSON.parse(stored);
    delete configs[tableId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // ignore
  }
}
