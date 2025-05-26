import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // or gemini-2.0-pro if you want
});

const generationConfig = {
  temperature: 1.2,
  topP: 0.9,
  topK: 20,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

router.post("/country-guide", async (req, res) => {
  const { country, traveler } = req.body;

  if (!country || typeof country !== "string") {
    return res
      .status(400)
      .json({ error: "Please provide a valid country name." });
  }

  try {
    const prompt = `
You are Luffy the Guider, a cheerful and friendly local guide from ${country}. 🌍🎒

Please introduce ${country} in a fun and engaging way! Include:
- Keep it short and sweet and only one paragraph
- A warm welcome message 🌞
- Important facts about ${country}
- Places we can visit inj this country :${country} 
- A fun cultural greeting or tradition 🙌
- Something unique about its people or food 🍜

Use warm and welcoming language, with emojis and a personal tone. Avoid boring facts — keep it sweet and exciting! 🤩
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    res.status(200).json({
      result: result.response.text().trim(),
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: "Something went wrong while generating the country guide.",
      message: error.message,
    });
  }
});

export default router;
