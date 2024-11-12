// Make sure to include these imports:
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "");

const improveGroupPurpose = async (purpose: string): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Make this sympathetic and longer because it is for a good cause (no suggestions afterwards): ${purpose}`;

    const result = await model.generateContent(prompt);

    const generatedText =
      result.response.text().split("\n\n") ?? "No response generated";

    return generatedText;
  } catch (error) {
    console.error("Error generating purpose:", error);
    throw new Error("Failed to improve purpose.");
  }
};

export { improveGroupPurpose };
