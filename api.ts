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
      systemInstruction: "Jesteś Stefan, profesjonalny asystent prawny. Twoim celem jest udzielanie precyzyjnych, rzetelnych i pomocnych informacji z zakresu prawa. Odpowiadaj zawsze w języku polskim, używając profesjonalnego, ale zrozumiałego języka. Opieraj się na obowiązujących przepisach prawa, ale zawsze zaznaczaj, że Twoja porada nie zastępuje oficjalnej opinii prawnej adwokata lub radcy prawnego. Bądź uprzejmy, konkretny i skupiony na rozwiązywaniu problemów prawnych użytkownika."
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
