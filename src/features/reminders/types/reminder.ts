export type ReminderTone = "gentle" | "practical" | "encouraging";

export interface Reminder {
  id: string;
  title: string;
  scheduledAt?: string;
  tone: ReminderTone;
  completedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderSettings {
  remindersEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  hapticsEnabled: boolean;
  tone: ReminderTone;
}

export interface CreateReminderInput {
  title: string;
  scheduledAt?: string;
  tone?: ReminderTone;
}
