import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";

const router = express.Router();

// Initialize Gemini with the provided key
// In a real production env, this should be in process.env, but for this fix we use it directly as requested
const genAI = new GoogleGenerativeAI("AIzaSyCHoAefaJI2U-zsaPcxS2TO6T-sIlVENGE");

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Convert frontend history format to Gemini format
    // Frontend: { sender: 'user' | 'bot', text: string }
    // Gemini: { role: 'user' | 'model', parts: [{ text: string }] }
    const chatHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: `Jesteś Stefan, profesjonalny asystent prawny. Twoim celem jest udzielanie precyzyjnych, rzetelnych i pomocnych informacji z zakresu prawa.

KONTEKST CZASOWY:
Dzisiejsza data to: ${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}.
Wszelkie analizy terminów, przedawnień czy wejścia w życie przepisów muszą odnosić się do tej daty.

KLUCZOWE ZASADY DZIAŁANIA:
1. **Analiza Wielowątkowa:** Nie podawaj jednej prostej odpowiedzi. Przeanalizuj problem z różnych perspektyw (np. ryzyka, korzyści, alternatywne interpretacje przepisów, orzecznictwo).
2. **Źródła Prawa:** Opieraj się na aktualnych przepisach (ISAP - Internetowy System Aktów Prawnych). Zawsze cytuj konkretne artykuły i ustawy (np. 'zgodnie z art. X Kodeksu Cywilnego').
3. **Język:** Używaj profesjonalnego języka prawniczego, ale wyjaśniaj trudne terminy w sposób zrozumiały dla klienta.
4. **Zastrzeżenie:** Zawsze zaznaczaj, że Twoja porada nie zastępuje oficjalnej opinii prawnej adwokata lub radcy prawnego.

Bądź uprzejmy, konkretny i skupiony na rozwiązywaniu problemów prawnych użytkownika.`
    });
    
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "No text provided for analysis" });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: `Jesteś Stefan, profesjonalny asystent prawny specjalizujący się w analizie umów i dokumentów prawnych.

TWOJE ZADANIE:
Przeprowadź szczegółową analizę przesłanego tekstu dokumentu prawnego.

STRUKTURA ODPOWIEDZI (użyj Markdown):
1. **Podsumowanie:** Krótki opis, czego dotyczy dokument.
2. **Kluczowe Ryzyka:** Wypunktuj potencjalne zagrożenia dla klienta (np. kary umowne, niekorzystne terminy, brak zabezpieczeń). Oznacz je ikonami ⚠️.
3. **Klauzule Niedozwolone (Abuzywne):** Jeśli wykryjesz zapisy niezgodne z prawem konsumenckim lub rażąco naruszające interesy, wskaż je wyraźnie.
4. **Braki Formalne:** Czego brakuje w dokumencie (np. daty, podpisów, precyzyjnego określenia stron).
5. **Rekomendacje:** Konkretne sugestie zmian w treści.

ZASADY:
- Bądź skrupulatny i krytyczny.
- Cytuj fragmenty dokumentu, do których się odnosisz.
- Używaj prostego, zrozumiałego języka, tłumacząc prawniczy żargon.
- Pamiętaj o aktualnym stanie prawnym (Polska, ${new Date().getFullYear()}).`
    });

    const result = await model.generateContent(`Przeanalizuj poniższy dokument prawny:\n\n${text}`);
    const response = await result.response;
    const analysis = response.text();

    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing document:", error);
    res.status(500).json({ error: "Failed to analyze document" });
  }
});

export default router;
