import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./create-context";
import { exercises } from "../../schema";

export const exercisesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(exercises);
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        primary_muscle_group: z.string(),
        equipment: z.string(),
        instructions: z.string(),
        video_url: z.string().optional(),
        target_sets: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exercise = {
        exercise_id: randomUUID(),
        ...input,
      };
      await ctx.db.insert(exercises).values(exercise);
      return exercise;
    }),
});

export type ExercisesRouter = typeof exercisesRouter;
