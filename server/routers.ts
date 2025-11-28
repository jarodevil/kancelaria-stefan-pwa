import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// Simple Gemini API integration without external dependencies
async function callGeminiAPI(message: string, history: any[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const currentDate = new Date().toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const systemPrompt = `Jesteś Stefan, Starszy Partner w polskiej kancelarii prawnej KancelariAI. Dzisiejsza data: ${currentDate}.

ZASADY:
1. Podawaj źródła prawne (np. "art. 353¹ Kodeksu cywilnego")
2. Używaj TYLKO polskiego prawa obowiązującego w ${new Date().getFullYear()} roku
3. Na końcu KAŻDEJ odpowiedzi dodaj: "⚠️ Analiza nie stanowi porady prawnej. W sprawach wymagających większej opinii skonsultuj się z uprawnionym doradcą."

Odpowiadaj po polsku, zwięźle i merytorycznie.`;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: "Rozumiem. Jestem gotowy do udzielania rzetelnych porad prawnych." }],
    },
    ...history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[Gemini API Error]", error);
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export const appRouter = router({
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
        try {
          const response = await callGeminiAPI(input.message, input.history || []);
          return {
            success: true,
            message: response,
            model: "gemini-2.0-flash-exp",
          };
        } catch (error: any) {
          console.error("[Chat Error]", error);
          return {
            success: false,
            message: "Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.",
            model: "fallback",
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
        try {
          const currentDate = new Date().toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const prompt = `Jesteś ekspertem prawnym. Dzisiejsza data: ${currentDate}.

ZADANIE: Przeanalizuj poniższy dokument prawny i wskaż:
1. **Typ dokumentu**
2. **Potencjalne ryzyka**
3. **Rekomendacje**

DOKUMENT:
${input.content}

ANALIZA:`;

          const analysis = await callGeminiAPI(prompt, []);
          
          return {
            success: true,
            analysis,
            sources: [],
            model: "gemini-2.0-flash-exp",
          };
        } catch (error: any) {
          console.error("[Analysis Error]", error);
          return {
            success: false,
            analysis: "Nie udało się przeanalizować dokumentu. Spróbuj ponownie.",
            sources: [],
            model: "fallback",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
