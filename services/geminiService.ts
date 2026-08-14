
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please check your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function suggestResearchImprovements(title: string, link: string) {
  try {
    const ai = getAI();
    
    // Using gemini-3-flash-preview as per skill guidelines for text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        As an academic reviewer, provide 2 brief bullet points to improve a research paper 
        titled "${title}". 
        Even though you can't access the link "${link}" directly, provide general 
        best-practice suggestions based on common pitfalls in such research fields.
      `,
    });
    
    return response.text || "No suggestions available at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Assistant is currently unavailable. Please provide manual feedback.";
  }
}