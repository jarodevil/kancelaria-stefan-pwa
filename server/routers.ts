import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// --- KONFIGURACJA GEMINI ---

// 1. Wklej tutaj swój klucz API z Google AI Studio zamiast "TU_WKLEJ_SWOJ_KLUCZ_API"
// Jeśli wolisz zmienne środowiskowe, zostaw process.env... ale upewnij się, że są ustawione.
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCHoAefaJI2U-zsaPcxS2TO6T-sIlVENGE"; 

// 2. Wybór modelu - do prawa polecam 1.5-pro (dokładniejszy) zamiast 2.0-flash (zbyt szybki/kreatywny)
const MODEL_NAME = "gemini-1.5-pro"; 

async function callGeminiAPI(message: string, history: any[] = [], isAnalysis: boolean = false) {
  if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
    console.error("BRAK KLUCZA API! Uzupełnij go w pliku server/routers.ts");
    throw new Error("API Key not configured");
  }

  const currentDate = new Date().toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Różne instrukcje w zależności od trybu (Czat vs Analiza)
  let systemInstructionText = "";
  
  if (isAnalysis) {
    systemInstructionText = `Jesteś Stefan, audytor prawny. Data: ${currentDate}.
ZADANIE: Analiza dokumentu pod kątem zagrożeń.
ZASADY BEZWZGLĘDNE:
1. Zero inwencji twórczej - opieraj się tylko na tekście i ustawach.
2. Jeśli dokument nie zawiera daty/podpisu - zgłoś to jako błąd formalny.
3. Wypunktuj ryzyka ikoną ⚠️.`;
  } else {
    systemInstructionText = `Jesteś Stefan, Starszy Partner w kancelarii. Data: ${currentDate}.
ZASADY BEZWZGLĘDNE:
1. Temperatura wypowiedzi 0.0 - zero zmyślania.
2. Jeśli prawo jest jasne, podaj przepis. Jeśli nie jesteś pewien, napisz "Konieczna konsultacja z radcą".
3. Nie wymyślaj treści artykułów.
4. Zawsze dodaj disclaimer: "⚠️ To nie jest porada prawna."`;
  }

  // Budowa payloadu dla API
  const requestBody = {
    contents: [
      // Historia rozmowy
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      // Bieżąca wiadomość
      {
        role: "user",
        parts: [{ text: message }],
      }
    ],
    // Nowy sposób przekazywania instrukcji systemowej w Gemini API
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    // KLUCZOWE: Parametry blokujące halucynacje
    generationConfig: {
      temperature: 0.0,      // Maksymalna precyzja
      maxOutputTokens: 3000, // Długie odpowiedzi
      topP: 0.95,
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
    const errorText = await response.text();
    console.error("[Gemini API Error]", errorText);
    throw new Error(`Gemini Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Zabezpieczenie przed pustą odpowiedzią
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Empty response from AI");
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
          // Mapowanie roli 'assistant' na 'model' dla Gemini
          const formattedHistory = (input.history || []).map(h => ({
            role: h.role === "assistant" ? "model" : "user",
            content: h.content
          }));

          const response = await callGeminiAPI(input.message, formattedHistory, false);
          return {
            success: true,
            message: response,
            model: MODEL_NAME,
          };
        } catch (error: any) {
          console.error("[Chat Error]", error);
          return {
            success: false,
            message: "Przepraszam, wystąpił problem z połączeniem z Mecenasem Stefanem.",
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
          const analysis = await callGeminiAPI(prompt, [], true); // true = tryb analizy
          
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
            analysis: "Nie udało się przeanalizować dokumentu.",
            sources: [],
            model: "error",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
