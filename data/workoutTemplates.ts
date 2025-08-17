import { WorkoutTemplate } from "@/types/workout";

export const defaultWorkoutTemplates: WorkoutTemplate[] = [
  {
    name: "3-Day Full Body",
    days: [
      { name: "Day 1", muscleGroups: ["Chest", "Back", "Legs"] },
      { name: "Day 2", muscleGroups: ["Shoulders", "Arms"] },
      { name: "Day 3", muscleGroups: ["Chest", "Back", "Legs"] },
    ],
  },
  {
    name: "4-Day Upper/Lower",
    days: [
      { name: "Upper 1", muscleGroups: ["Chest", "Shoulders", "Triceps"] },
      { name: "Lower 1", muscleGroups: ["Quads", "Hamstrings", "Calves"] },
      { name: "Upper 2", muscleGroups: ["Back", "Biceps"] },
      { name: "Lower 2", muscleGroups: ["Quads", "Hamstrings", "Glutes"] },
    ],
  },
];
