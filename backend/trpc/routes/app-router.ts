import { createTRPCRouter } from "./create-context";
import { exercisesRouter } from "./exercises";
import { mesocyclesRouter } from "./mesocycles";
import { workoutDaysRouter } from "./workout-days";
import { draftsRouter } from "./drafts";

export const appRouter = createTRPCRouter({
  exercises: exercisesRouter,
  mesocycles: mesocyclesRouter,
  workoutDays: workoutDaysRouter,
  drafts: draftsRouter,
});

export type AppRouter = typeof appRouter;
