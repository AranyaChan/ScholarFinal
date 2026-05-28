import express from 'express';
const router = express.Router();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
dotenv.config();

router.post('/', async (req, res) => {
  const { paper, summary } = req.body;
  if (!paper || !summary) {
    return res.status(400).json({ error: 'Missing paper or summary data' });
  }
  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.7,
    });

    const systemPrompt = `You are an expert AI research critic. Given a research paper and its summary, provide a structured critique with the following fields:
    - strengths: List 3-5 strengths as bullet points
    - weaknesses: List 3-5 weaknesses as bullet points
    - novelty: Rate as 'high', 'medium', or 'low'
    - methodology: Rate as 'strong', 'adequate', or 'weak'
    - bias: List 2-3 potential biases
    - overallRating: Give a number from 1-10 (float allowed)
    Respond in JSON format with keys: strengths, weaknesses, novelty, methodology, bias, overallRating.`;

    const userPrompt = `Title: ${paper.title}\nAbstract: ${paper.abstract}\nSummary: ${JSON.stringify(summary)}`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ]);

    let critique;
    let content = response.content;
    // Remove code block markers if present
    if (typeof content === 'string') {
      const match = content.match(/```json[\r\n]*([\s\S]*?)```/i) || content.match(/```[\r\n]*([\s\S]*?)```/i);
      if (match) {
        content = match[1];
      }
    }
    try {
      critique = JSON.parse(content);
    } catch (e) {
      critique = { raw: response.content };
    }
  
    res.json({ critique });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: 'Failed to generate critique', details: err.message });
  }
});

export default router;
