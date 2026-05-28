import express from 'express';
const router = express.Router();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
dotenv.config();

router.post('/', async (req, res) => {
  const { paper } = req.body;
  if (!paper || !paper.title || !paper.abstract) {
    return res.status(400).json({ error: 'Missing paper data' });
  }

  try {
   const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.7,
    });

    const systemPrompt = `You are an expert AI research assistant. Given the title and abstract of a research paper, generate a comprehensive summary with the following fields:
    - keyFindings: List 3-5 key findings as bullet points
    - methodology: Describe the methodology in 2-3 sentences
    - implications: Summarize the implications in 2-3 sentences
    - limitations: List 1-2 limitations in 1-2 sentences
    Respond in JSON format with keys: keyFindings, methodology, implications, limitations.`;

    const userPrompt = `Title: ${paper.title}\nAbstract: ${paper.abstract}`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ]);

    // Try to extract and parse JSON from Gemini response
    let summary;
    let content = response.content;
    // Remove code block markers if present
    if (typeof content === 'string') {
      const match = content.match(/```json[\r\n]*([\s\S]*?)```/i) || content.match(/```[\r\n]*([\s\S]*?)```/i);
      if (match) {
        content = match[1];
      }
    }
    try {
      summary = JSON.parse(content);
    } catch (e) {
      // Fallback: return the raw text if not valid JSON
      summary = { raw: response.content };
    }
    console.log(summary)
    res.json({ summary });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: 'Failed to generate summary', details: err.message });
  }
});

export default router;
