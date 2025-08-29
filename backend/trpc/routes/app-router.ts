import { createTRPCRouter } from "./create-context";
import { exercisesRouter } from "./exercises";

export const appRouter = createTRPCRouter({
  exercises: exercisesRouter,
});

export type AppRouter = typeof appRouter;
