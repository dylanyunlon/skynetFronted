/**
 * Notification System — Toast notification management (sonner patterns)
 */

// --- Types ---
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  duration: number;
  createdAt: Date;
  action?: { label: string; onClick: string };
}

export interface NotificationQueue {
  notifications: Notification[];
  totalCount: number;
}

// --- Constants ---
export const MAX_VISIBLE_NOTIFICATIONS = 5;

export const AUTO_DISMISS_DELAYS: Record<NotificationType, number> = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 8000,
};

let _idCounter = 0;

// --- Factory ---
export function createNotification(opts: {
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
}): Notification {
  return {
    id: `notif-${Date.now()}-${++_idCounter}`,
    type: opts.type,
    title: opts.title,
    description: opts.description,
    duration: opts.duration ?? AUTO_DISMISS_DELAYS[opts.type],
    createdAt: new Date(),
  };
}

// --- Queue ---
export function createNotificationQueue(): NotificationQueue {
  return { notifications: [], totalCount: 0 };
}

export function addNotification(queue: NotificationQueue, notification: Notification): NotificationQueue {
  return {
    notifications: [notification, ...queue.notifications],
    totalCount: queue.totalCount + 1,
  };
}

export function dismissNotification(queue: NotificationQueue, id: string): NotificationQueue {
  return {
    ...queue,
    notifications: queue.notifications.filter(n => n.id !== id),
  };
}

export function clearAllNotifications(queue: NotificationQueue): NotificationQueue {
  return { notifications: [], totalCount: queue.totalCount };
}

export function getActiveNotifications(queue: NotificationQueue): Notification[] {
  return queue.notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
}

// --- Tool Notifications ---
export function formatToolNotification(
  toolName: string,
  success: boolean,
  meta?: { command?: string; exitCode?: number; filename?: string }
): Notification {
  if (!success) {
    const desc = meta?.exitCode !== undefined ? `Exit code: ${meta.exitCode}` : undefined;
    return createNotification({
      type: 'error',
      title: `${toolName} failed`,
      description: desc,
    });
  }

  let title = `${toolName} completed`;
  if (meta?.filename) title = `Edited ${meta.filename}`;
  if (meta?.command) title = `${toolName}: ${meta.command.slice(0, 40)}`;

  return createNotification({ type: 'success', title });
}

export function formatErrorNotification(error: string | Error): Notification {
  const message = error instanceof Error ? error.message : error;
  return createNotification({ type: 'error', title: message });
}

export function formatSuccessNotification(message: string): Notification {
  return createNotification({ type: 'success', title: message });
}
