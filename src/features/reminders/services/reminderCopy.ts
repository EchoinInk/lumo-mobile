import type { ReminderTone } from "../types/reminder";

const copy: Record<ReminderTone, string[]> = {
  gentle: ["Tiny next step?", "Want a soft nudge?", "One small thing is enough."],
  practical: ["A small task is ready.", "Time for the next step.", "This can be brief."],
  encouraging: ["You've got room for one small win.", "A little progress counts.", "Start where you are."],
};

export function getReminderCopy(tone: ReminderTone): string {
  const options = copy[tone];
  return options[Math.floor(Math.random() * options.length)] ?? options[0];
}
