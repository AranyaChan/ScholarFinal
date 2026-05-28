import express from 'express';
const router = express.Router();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
dotenv.config();

router.post('/', async (req, res) => {
  const { paper, summary, critique } = req.body;
  if (!paper || !summary) {
    return res.status(400).json({ error: 'Missing paper or summary data' });
  }
  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.7,
    });

    const systemPrompt = `You are an expert AI presentation assistant. Given a research paper, its summary, and (optionally) a critique, generate a slide deck structure as JSON with the following format:
    {
      title: string,
      slides: [
        { title: string, content: string[], type: 'title' | 'content' | 'conclusion' },
        ...
      ]
    }
    Include slides for: Title, Key Findings, Methodology, Implications, Limitations, (optional) Critique, and Conclusion. Each slide's content should be a list of bullet points or short paragraphs.`;

    const userPrompt = `Title: ${paper.title}\nAbstract: ${paper.abstract}\nSummary: ${JSON.stringify(summary)}\nCritique: ${critique ? JSON.stringify(critique) : 'N/A'}`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ]);

    let slides;
    let content = response.content;
    // Remove code block markers if present
    if (typeof content === 'string') {
      const match = content.match(/```json[\r\n]*([\s\S]*?)```/i) || content.match(/```[\r\n]*([\s\S]*?)```/i);
      if (match) {
        content = match[1];
      }
    }
    try {
      slides = JSON.parse(content);
    } catch (e) {
      slides = { raw: response.content };
    }
 
    res.json({ slides });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate slides', details: err.message });
  }
});

export default router;
