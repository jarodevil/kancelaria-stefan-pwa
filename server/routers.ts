import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

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
        const currentDate = new Date().toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const systemPrompt = `Jesteś Stefan, Starszy Partner w kancelarii prawnej. Dzisiejsza data to ${currentDate}.

Twoja rola:
- Udzielasz fachowych porad prawnych zgodnie z polskim prawem
- Wyjaśniasz zagadnienia prawne w sposób przystępny
- Pomagasz w interpretacji przepisów i dokumentów
- Zawsze odnosisz się do aktualnego stanu prawnego

Ważne zasady:
- Zawsze podkreślaj, że nie zastępujesz profesjonalnej porady prawnej
- W skomplikowanych sprawach zalecaj konsultację z prawnikiem
- Bądź konkretny i rzeczowy
- Używaj języka polskiego`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...(input.history || []).map(msg => ({
            role: msg.role === "user" ? "user" as const : "assistant" as const,
            content: msg.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        try {
          const response = await invokeLLM({ messages });
          const assistantMessage = response.choices[0]?.message?.content || "Przepraszam, wystąpił problem z generowaniem odpowiedzi.";
          
          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("Chat error:", error);
          return {
            success: false,
            message: "Przepraszam, wystąpił błąd podczas przetwarzania Twojego pytania. Spróbuj ponownie.",
          };
        }
      }),
  }),

  analysis: router({
    analyzeDocument: publicProcedure
      .input(z.object({
        content: z.string(),
        filename: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const currentDate = new Date().toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const systemPrompt = `Jesteś ekspertem prawnym analizującym dokumenty. Dzisiejsza data to ${currentDate}.

Przeprowadź szczegółową analizę prawną dokumentu, uwzględniając:
1. **Podsumowanie**: Krótkie streszczenie treści dokumentu
2. **Kluczowe Postanowienia**: Najważniejsze zapisy i ich znaczenie
3. **Potencjalne Ryzyka**: Problematyczne klauzule lub braki
4. **Rekomendacje**: Sugestie dotyczące zmian lub działań

Używaj języka polskiego i formatuj odpowiedź w markdown.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: `Przeanalizuj następujący dokument:\n\n${input.content}` },
        ];

        try {
          const response = await invokeLLM({ messages });
          const analysis = response.choices[0]?.message?.content || "Nie udało się przeanalizować dokumentu.";
          
          return {
            success: true,
            analysis,
          };
        } catch (error) {
          console.error("Analysis error:", error);
          return {
            success: false,
            analysis: "Przepraszam, wystąpił błąd podczas analizy dokumentu.",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
