export type BrainDumpStatus = "open" | "converted" | "archived";

export type BrainDumpConversionTarget =
  | "task"
  | "reminder"
  | "routine_idea"
  | "archived_note";

export interface BrainDumpEntry {
  id: string;
  text: string;
  status: BrainDumpStatus;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedTo?: BrainDumpConversionTarget;
  linkedEntityId?: string;
}

export interface CreateBrainDumpInput {
  text: string;
}
