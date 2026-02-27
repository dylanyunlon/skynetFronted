/**
 * cn() — Tailwind className merge utility
 * Same pattern used by marimo and shadcn/ui
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
