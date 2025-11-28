import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { chat, analyzeDocument } from "./services/aiService";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    sendMessage: publicProcedure
      .input(z.object({
        message: z.string(),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await chat(input.message, input.history || []);
        return result;
      }),
  }),

  analysis: router({
    analyzeDocument: publicProcedure
      .input(z.object({
        content: z.string(),
        filename: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await analyzeDocument(input.content);
        return {
          success: result.success,
          analysis: result.message,
          sources: result.sources,
          model: result.model,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
