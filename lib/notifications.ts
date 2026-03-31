// Notification System for Students
export interface Notification {
  id: string;
  studentId: string;
  type: "letter_approved" | "letter_rejected" | "general";
  title: string;
  message: string;
  letterRequestId?: string;
  serialNumber?: string;
  letterType?: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_KEY = "student_notifications";

// Get all notifications for a student
export function getStudentNotifications(studentId: string): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return [];
  const allNotifications: Notification[] = JSON.parse(stored);
  return allNotifications
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get unread count
export function getUnreadNotificationCount(studentId: string): number {
  const notifications = getStudentNotifications(studentId);
  return notifications.filter((n) => !n.read).length;
}

// Add a notification
export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

  const newNotification: Notification = {
    ...notification,
    id: `NOTIF${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  allNotifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
}

// Mark notification as read
export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return;
  const allNotifications: Notification[] = JSON.parse(stored);
  const updated = allNotifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

// Mark all notifications as read for a student
export function markAllNotificationsAsRead(studentId: string): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return;
  const allNotifications: Notification[] = JSON.parse(stored);
  const updated = allNotifications.map((n) =>
    n.studentId === studentId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

// Delete notification
export function deleteNotification(notificationId: string): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return;
  const allNotifications: Notification[] = JSON.parse(stored);
  const updated = allNotifications.filter((n) => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}
