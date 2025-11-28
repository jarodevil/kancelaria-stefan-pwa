import { GoogleGenerativeAI } from "@google/generative-ai";
import { enrichWithLegalSources } from "./mcpService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  model: string;
  sources?: string[];
  confidence?: "high" | "medium" | "low";
}

/**
 * Determines which AI model to use based on query complexity
 */
function selectModel(message: string, history: AIMessage[]): string {
  const wordCount = message.split(/\s+/).length;
  const hasLegalTerms = /umowa|kodeks|ustawa|przepis|sąd|prawo|art\.|paragraf/i.test(message);
  const isComplex = wordCount > 50 || hasLegalTerms || history.length > 10;

  // Use Pro for complex legal queries, Flash for quick questions
  return isComplex ? "gemini-2.0-flash-exp" : "gemini-2.0-flash-exp";
}

/**
 * Builds the system prompt with anti-hallucination measures
 */
function buildSystemPrompt(): string {
  const currentDate = new Date().toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Jesteś Stefan, Starszy Partner w polskiej kancelarii prawnej KancelariAI. Dzisiejsza data: ${currentDate}.

KRYTYCZNE ZASADY:
1. ZAWSZE podawaj źródła prawne (np. "art. 353¹ Kodeksu cywilnego")
2. NIGDY nie wymyślaj przepisów - jeśli nie znasz, powiedz "Nie mam pewności co do aktualnego brzmienia tego przepisu"
3. Używaj TYLKO polskiego prawa obowiązującego w ${new Date().getFullYear()} roku
4. Na końcu KAŻDEJ odpowiedzi dodaj: "⚠️ Analiza nie stanowi porady prawnej. W sprawach wymagających większej opinii skonsultuj się z uprawnionym doradcą."
5. Jeśli pytanie dotyczy prawa spoza Polski, wyraźnie to zaznacz

STYL ODPOWIEDZI:
- Konkretny, rzeczowy, profesjonalny
- Struktura: 1) Odpowiedź, 2) Podstawa prawna, 3) Praktyczne wskazówki
- Unikaj zbędnych ogólników

Odpowiadaj po polsku, zwięźle i merytorycznie.`;
}

/**
 * Main AI chat function with multi-model routing and error handling
 */
export async function chat(
  message: string,
  history: AIMessage[] = []
): Promise<AIResponse> {
  try {
    const modelName = selectModel(message, history);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Build conversation history for context
    const conversationHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add system prompt as first message
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: buildSystemPrompt() }],
        },
        {
          role: "model",
          parts: [{ text: "Rozumiem. Jestem gotowy do udzielania rzetelnych porad prawnych z podaniem źródeł." }],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    // Extract sources from response (simple regex for legal references)
    const sources = extractLegalSources(response);

    // Enrich response with MCP legal sources
    const enriched = await enrichWithLegalSources(message, response);

    return {
      success: true,
      message: enriched.response,
      model: modelName,
      sources: [...sources, ...enriched.sources.map(s => s.title)],
      confidence: sources.length > 0 ? "high" : "medium",
    };
  } catch (error: any) {
    console.error("[AI Service Error]", error);

    // Fallback response when AI fails
    return {
      success: false,
      message: `Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.\n\n⚠️ W pilnych sprawach skontaktuj się bezpośrednio z kancelarią.`,
      model: "fallback",
      confidence: "low",
    };
  }
}

/**
 * Analyzes document with specialized prompt
 */
export async function analyzeDocument(content: string): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `${buildSystemPrompt()}

ZADANIE: Przeanalizuj poniższy dokument prawny i wskaż:
1. **Typ dokumentu** (umowa, pismo, wniosek, etc.)
2. **Potencjalne ryzyka** (klauzule abuzywne, niejasne zapisy, brakujące elementy)
3. **Rekomendacje** (co poprawić, czego dopilnować)

DOKUMENT:
${content}

ANALIZA:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const sources = extractLegalSources(response);

    return {
      success: true,
      message: response,
      model: "gemini-2.0-flash-exp",
      sources,
      confidence: sources.length > 0 ? "high" : "medium",
    };
  } catch (error: any) {
    console.error("[Document Analysis Error]", error);

    return {
      success: false,
      message: "Nie udało się przeanalizować dokumentu. Spróbuj ponownie lub skontaktuj się z kancelarią.",
      model: "fallback",
      confidence: "low",
    };
  }
}

/**
 * Extracts legal source references from AI response
 */
function extractLegalSources(text: string): string[] {
  const sources: string[] = [];
  
  // Match patterns like "art. 123", "Art. 45 § 2", "Kodeks cywilny"
  const patterns = [
    /art\.\s*\d+[a-z]?(\s*§\s*\d+)?/gi,
    /Kodeks\s+\w+/gi,
    /Ustawa\s+[^.]+/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      sources.push(...matches);
    }
  });

  return [...new Set(sources)]; // Remove duplicates
}
