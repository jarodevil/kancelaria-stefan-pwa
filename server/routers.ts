import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// --- KONFIGURACJA ---
// WAŻNE: Tutaj wklej swój klucz, jeśli process.env nie działa
const API_KEY = process.env.GEMINI_API_KEY || "TU_WKLEJ_SWOJ_KLUCZ_AIza..."; 
const MODEL_NAME = "gemini-1.5-pro"; // Zmieniono na model stabilny, lepszy do prawa

async function callGeminiAPI(message: string, history: any[] = [], isAnalysis: boolean = false) {
  if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
    console.error("BRAK KLUCZA API! Uzupełnij go w pliku server/routers.ts");
    // Aby nie wywalić aplikacji, rzucamy błąd w konsolę, ale próbujemy działać dalej jeśli env jest ustawiony
  }

  const currentDate = new Date().toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Definicja Systemowa (Mózg Stefana)
  let systemInstructionText = "";
  if (isAnalysis) {
    systemInstructionText = `Jesteś Stefan, audytor prawny. Data: ${currentDate}.
CEL: Bezwzględna weryfikacja dokumentu pod kątem ryzyk.
ZASADY:
- Zero inwencji twórczej. Opieraj się TYLKO na dostarczonym tekście.
- Jeśli dokument nie ma daty/podpisu -> zgłoś to jako błąd.
- Ryzyka oznaczaj ikoną ⚠️.`;
  } else {
    systemInstructionText = `Jesteś Stefan, Starszy Partner w kancelarii. Data: ${currentDate}.
CEL: Udzielanie precyzyjnych informacji o polskim prawie.
ZASADY KRYTYCZNE:
1. Temperatura 0.0 - Zakaz wymyślania przepisów.
2. Jeśli nie znasz treści artykułu, napisz "Należy zweryfikować w ustawie". Nie cytuj z pamięci.
3. Odpowiedzi muszą być zgodne ze stanem prawnym na rok ${new Date().getFullYear()}.
4. Zawsze dodaj: "⚠️ To nie jest porada prawna."`;
  }

  // 2. Budowa zapytania do Google
  const requestBody = {
    contents: [
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      }
    ],
    // To pole jest kluczowe dla posłuszeństwa modelu
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    // To pole jest kluczowe dla wyłączenia halucynacji
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 8192,
      topP: 0.95
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[Gemini API Error]", error);
    throw new Error(`Błąd API Gemini: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Pusta odpowiedź od AI (możliwa blokada treści)");
  }

  return data.candidates[0].content.parts[0].text;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
          // Mapowanie ról dla funkcji pomocniczej
          const cleanHistory = (input.history || []).map(h => ({
            role: h.role, // Funkcja callGeminiAPI obsłuży mapowanie user/model
            content: h.content
          }));

          const response = await callGeminiAPI(input.message, cleanHistory, false);
          return {
            success: true,
            message: response,
            model: MODEL_NAME,
          };
        } catch (error: any) {
          console.error("[Chat Error]", error);
          return {
            success: false,
            message: "Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie.",
            model: "error",
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
          const prompt = `DOKUMENT DO ANALIZY:\n${input.content}`;
          // Przekazujemy true jako trzeci parametr -> tryb analizy
          const analysis = await callGeminiAPI(prompt, [], true);
          
          return {
            success: true,
            analysis,
            sources: [],
            model: MODEL_NAME,
          };
        } catch (error: any) {
          console.error("[Analysis Error]", error);
          return {
            success: false,
            analysis: "Nie udało się przeanalizować dokumentu. Sprawdź logi.",
            sources: [],
            model: "error",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
