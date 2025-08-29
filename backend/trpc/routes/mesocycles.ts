import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./create-context";
import { mesocycles } from "../../schema";

export const mesocyclesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(mesocycles).where((f, { eq }) => eq(f.user_id, input.user_id));
    }),

  create: publicProcedure
    .input(z.object({
      user_id: z.string(),
      meso_name: z.string(),
      duration_weeks: z.number().int().min(1),
      start_date: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const row = {
        meso_id: randomUUID(),
        user_id: input.user_id,
        meso_name: input.meso_name,
        start_date: input.start_date,
        duration_weeks: input.duration_weeks,
        is_active: 1,
      } as any;
      await ctx.db.insert(mesocycles).values(row);
      return row;
    }),

  setActive: publicProcedure
    .input(z.object({ user_id: z.string(), meso_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.select().from(mesocycles).where((f, { eq }) => eq(f.user_id, input.user_id));
      for (const m of list) {
        await ctx.db
          .update(mesocycles)
          .set({ is_active: m.meso_id === input.meso_id ? 1 : 0 })
          .where((f, { eq }) => eq(f.meso_id, m.meso_id));
      }
      return { ok: true };
    }),

  update: publicProcedure
    .input(z.object({
      meso_id: z.string(),
      meso_name: z.string().optional(),
      duration_weeks: z.number().int().min(1).optional(),
      start_date: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { meso_id, ...updates } = input;
      await ctx.db.update(mesocycles).set(updates as any).where((f, { eq }) => eq(f.meso_id, meso_id));
      return { ok: true };
    }),

  delete: publicProcedure
    .input(z.object({ meso_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(mesocycles).where((f, { eq }) => eq(f.meso_id, input.meso_id));
      return { ok: true };
    }),
});

export type MesocyclesRouter = typeof mesocyclesRouter;

