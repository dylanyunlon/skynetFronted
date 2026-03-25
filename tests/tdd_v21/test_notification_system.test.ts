/**
 * TDD v21 Module 5: Notification System
 * Tests for toast notification management using sonner patterns
 * Target: src/utils/notificationSystem.ts
 */
import { describe, it, expect } from 'vitest';

import {
  NotificationType,
  Notification,
  createNotification,
  NotificationQueue,
  createNotificationQueue,
  addNotification,
  dismissNotification,
  clearAllNotifications,
  getActiveNotifications,
  formatToolNotification,
  formatErrorNotification,
  formatSuccessNotification,
  MAX_VISIBLE_NOTIFICATIONS,
  AUTO_DISMISS_DELAYS,
} from '@/utils/notificationSystem';

describe('Notification System', () => {
  // --- Create Notification ---
  describe('createNotification', () => {
    it('should create notification with unique id', () => {
      const n1 = createNotification({ type: 'success', title: 'Done' });
      const n2 = createNotification({ type: 'success', title: 'Done' });
      expect(n1.id).not.toBe(n2.id);
    });

    it('should set type correctly', () => {
      const n = createNotification({ type: 'error', title: 'Failed' });
      expect(n.type).toBe('error');
    });

    it('should include title and optional description', () => {
      const n = createNotification({ type: 'info', title: 'Info', description: 'Details here' });
      expect(n.title).toBe('Info');
      expect(n.description).toBe('Details here');
    });

    it('should set createdAt timestamp', () => {
      const n = createNotification({ type: 'success', title: 'Test' });
      expect(n.createdAt).toBeInstanceOf(Date);
    });

    it('should default duration based on type', () => {
      const success = createNotification({ type: 'success', title: 'OK' });
      const error = createNotification({ type: 'error', title: 'Fail' });
      expect(success.duration).toBeLessThan(error.duration);
    });

    it('should allow custom duration override', () => {
      const n = createNotification({ type: 'info', title: 'Custom', duration: 10000 });
      expect(n.duration).toBe(10000);
    });
  });

  // --- Notification Queue ---
  describe('createNotificationQueue', () => {
    it('should create empty queue', () => {
      const q = createNotificationQueue();
      expect(q.notifications).toEqual([]);
      expect(q.totalCount).toBe(0);
    });
  });

  describe('addNotification', () => {
    it('should add notification to queue', () => {
      const q = createNotificationQueue();
      const n = createNotification({ type: 'success', title: 'Added' });
      const updated = addNotification(q, n);
      expect(updated.notifications.length).toBe(1);
      expect(updated.totalCount).toBe(1);
    });

    it('should cap visible notifications at MAX_VISIBLE', () => {
      let q = createNotificationQueue();
      for (let i = 0; i < MAX_VISIBLE_NOTIFICATIONS + 5; i++) {
        const n = createNotification({ type: 'info', title: `N${i}` });
        q = addNotification(q, n);
      }
      const active = getActiveNotifications(q);
      expect(active.length).toBeLessThanOrEqual(MAX_VISIBLE_NOTIFICATIONS);
    });

    it('should prepend new notifications (newest first)', () => {
      let q = createNotificationQueue();
      q = addNotification(q, createNotification({ type: 'info', title: 'First' }));
      q = addNotification(q, createNotification({ type: 'info', title: 'Second' }));
      expect(q.notifications[0].title).toBe('Second');
    });
  });

  describe('dismissNotification', () => {
    it('should remove notification by id', () => {
      let q = createNotificationQueue();
      const n = createNotification({ type: 'info', title: 'ToRemove' });
      q = addNotification(q, n);
      q = dismissNotification(q, n.id);
      expect(q.notifications.length).toBe(0);
    });

    it('should not fail for non-existent id', () => {
      const q = createNotificationQueue();
      const updated = dismissNotification(q, 'non-existent');
      expect(updated.notifications.length).toBe(0);
    });
  });

  describe('clearAllNotifications', () => {
    it('should remove all notifications', () => {
      let q = createNotificationQueue();
      q = addNotification(q, createNotification({ type: 'info', title: 'A' }));
      q = addNotification(q, createNotification({ type: 'error', title: 'B' }));
      q = clearAllNotifications(q);
      expect(q.notifications.length).toBe(0);
    });

    it('should preserve totalCount', () => {
      let q = createNotificationQueue();
      q = addNotification(q, createNotification({ type: 'info', title: 'A' }));
      q = addNotification(q, createNotification({ type: 'info', title: 'B' }));
      q = clearAllNotifications(q);
      expect(q.totalCount).toBe(2);
    });
  });

  // --- Tool Notifications ---
  describe('formatToolNotification', () => {
    it('should format bash tool result', () => {
      const n = formatToolNotification('bash_tool', true, { command: 'npm test' });
      expect(n.type).toBe('success');
      expect(n.title).toContain('bash');
    });

    it('should format failed tool as error', () => {
      const n = formatToolNotification('bash_tool', false, { exitCode: 1 });
      expect(n.type).toBe('error');
    });

    it('should format edit tool with file info', () => {
      const n = formatToolNotification('str_replace', true, { filename: 'app.tsx' });
      expect(n.title).toContain('app.tsx');
    });
  });

  describe('formatErrorNotification', () => {
    it('should create error notification from Error object', () => {
      const n = formatErrorNotification(new Error('Connection lost'));
      expect(n.type).toBe('error');
      expect(n.title).toContain('Connection lost');
    });

    it('should handle string errors', () => {
      const n = formatErrorNotification('Something went wrong');
      expect(n.type).toBe('error');
      expect(n.title).toContain('Something went wrong');
    });
  });

  describe('formatSuccessNotification', () => {
    it('should create success notification with message', () => {
      const n = formatSuccessNotification('Build completed');
      expect(n.type).toBe('success');
      expect(n.title).toBe('Build completed');
    });
  });

  // --- Constants ---
  describe('AUTO_DISMISS_DELAYS', () => {
    it('should have delays for each type', () => {
      expect(AUTO_DISMISS_DELAYS.success).toBeDefined();
      expect(AUTO_DISMISS_DELAYS.error).toBeDefined();
      expect(AUTO_DISMISS_DELAYS.info).toBeDefined();
      expect(AUTO_DISMISS_DELAYS.warning).toBeDefined();
    });

    it('should have error delay longer than success', () => {
      expect(AUTO_DISMISS_DELAYS.error).toBeGreaterThan(AUTO_DISMISS_DELAYS.success);
    });
  });

  describe('MAX_VISIBLE_NOTIFICATIONS', () => {
    it('should be at least 3', () => {
      expect(MAX_VISIBLE_NOTIFICATIONS).toBeGreaterThanOrEqual(3);
    });
  });
});
