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
    id: "evening-reset",
    title: "Evening reset",
    description: "Close the loop without making it a project.",
    items: [
      { title: "Clear one surface" },
      { title: "Put away five things" },
      { title: "Brain dump tomorrow thoughts" },
    ],
  },
  {
    id: "low-energy-day",
    title: "Low-energy day",
    description: "Enough care for a low-capacity day.",
    items: [
      { title: "Drink water" },
      { title: "Eat something simple" },
      { title: "Rest for ten minutes" },
    ],
  },
  {
    id: "focus-starter",
    title: "Focus starter",
    description: "A small setup for one focused pocket of time.",
    items: [
      { title: "Clear workspace" },
      { title: "Set a 10-minute timer" },
      { title: "Start the smallest step" },
    ],
  },
  {
    id: "home-reset",
    title: "Home reset",
    description: "A small reset without turning the day into chores.",
    items: [
      { title: "Pick up laundry" },
      { title: "Wipe one surface" },
      { title: "Take rubbish out" },
    ],
  },
  {
    id: "meal-prep-mini",
    title: "Meal prep mini",
    description: "Just enough food planning to lower friction.",
    items: [
      { title: "Check what food is available" },
      { title: "Prep one ingredient" },
      { title: "Choose one easy meal" },
    ],
  },
  {
    id: "calm-body-check",
    title: "Calm body check",
    description: "A gentle reset for your body.",
    items: [
      { title: "Stretch gently" },
      { title: "Drink water" },
      { title: "Take three slow breaths" },
    ],
  },
  {
    id: "admin-tiny-steps",
    title: "Admin tiny steps",
    description: "A contained way to face small life admin.",
    items: [
      { title: "Open inbox" },
      { title: "Reply to one message" },
      { title: "Write down one next admin task" },
    ],
  },
];
