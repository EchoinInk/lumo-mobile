import type { RoutineBundle } from "../types/routineBundle";

export const starterRoutineBundles: RoutineBundle[] = [
  {
    id: "morning-reset",
    title: "Morning reset",
    description: "A tiny landing pad for the day.",
    items: [
      { title: "Drink water" },
      { title: "Choose one priority" },
      { title: "Open curtains or step outside" },
    ],
  },
  {
    id: "evening-shutdown",
    title: "Evening shutdown",
    description: "Close the loop without making it a project.",
    items: [
      { title: "Clear one surface" },
      { title: "Choose tomorrow's first step" },
      { title: "Set one soft reminder" },
    ],
  },
  {
    id: "admin-catch-up",
    title: "Admin catch-up",
    description: "A contained way to face small life admin.",
    items: [
      { title: "Check one inbox" },
      { title: "Pay or note one bill" },
      { title: "File one loose item" },
    ],
  },
  {
    id: "meal-prep-light",
    title: "Meal prep light",
    description: "Enough food planning to make future-you breathe easier.",
    items: [
      { title: "Pick two simple meals" },
      { title: "Write a short grocery list" },
      { title: "Prep one ingredient" },
    ],
  },
  {
    id: "cleaning-reset",
    title: "Cleaning reset",
    description: "A small reset without turning the day into chores.",
    items: [
      { title: "Start one load or clear one bin" },
      { title: "Wipe one surface" },
      { title: "Put away five things" },
    ],
  },
];
