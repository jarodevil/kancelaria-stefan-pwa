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

export default router;
