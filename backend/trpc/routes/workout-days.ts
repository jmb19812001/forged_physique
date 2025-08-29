import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./create-context";
import { workout_days } from "../../schema";
import { eq } from "drizzle-orm";

export const workoutDaysRouter = createTRPCRouter({
  getByMesocycle: publicProcedure
    .input(z.object({ meso_id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(workout_days).where(eq(workout_days.meso_id, input.meso_id));
    }),

  saveForMesocycle: publicProcedure
    .input(z.object({
      meso_id: z.string(),
      days: z.array(z.object({
        day_id: z.string().optional(),
        day_name: z.string(),
        day_of_week: z.number().int().min(1).max(7),
        exercise_ids: z.array(z.string()).optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // naive approach: delete then insert
      await ctx.db.delete(workout_days).where(eq(workout_days.meso_id, input.meso_id));
      for (const d of input.days) {
        await ctx.db.insert(workout_days).values({
          day_id: d.day_id ?? randomUUID(),
          meso_id: input.meso_id,
          day_name: d.day_name,
          day_of_week: d.day_of_week,
          exercise_ids: d.exercise_ids ? JSON.stringify(d.exercise_ids) : null as any,
        } as any);
      }
      return { ok: true };
    }),

  deleteByMesocycle: publicProcedure
    .input(z.object({ meso_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workout_days).where(eq(workout_days.meso_id, input.meso_id));
      return { ok: true };
    }),
});

export type WorkoutDaysRouter = typeof workoutDaysRouter;




