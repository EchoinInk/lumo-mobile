export type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export type RecurrencePattern =
  | { type: "none" }
  | { type: "daily"; interval?: number }
  | { type: "weekly"; interval?: number; weekdays?: Weekday[] }
  | { type: "monthly"; interval?: number };
