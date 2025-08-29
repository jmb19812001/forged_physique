import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./create-context";
import { meso_drafts } from "../../schema";

export const draftsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.select().from(meso_drafts).where((f, { eq }) => eq(f.user_id, input.user_id));
      return res[0] ?? null;
    }),

  set: publicProcedure
    .input(z.object({ user_id: z.string(), draft: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const payload = { user_id: input.user_id, draft: JSON.stringify(input.draft), updated_at: now } as any;
      await ctx.db.insert(meso_drafts).values(payload).onConflictDoUpdate?.({
        target: meso_drafts.user_id,
        set: { draft: payload.draft, updated_at: payload.updated_at },
      } as any);
      return { ok: true };
    }),

  clear: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(meso_drafts).where((f, { eq }) => eq(f.user_id, input.user_id));
      return { ok: true };
    }),
});

export type DraftsRouter = typeof draftsRouter;

