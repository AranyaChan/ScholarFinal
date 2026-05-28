import express from 'express';
import PaperSelection from '../models/PaperSelection.js';

const router = express.Router();

// POST /api/paper/select
router.post('/select', async (req, res) => {
  const { userId = null, paper } = req.body;

  if (!paper || typeof paper !== 'object' || !paper.title) {
    return res.status(400).json({ error: 'Missing or invalid paper data' });
  }

  try {
    const selection = await PaperSelection.create({ userId, paper });
    res.status(201).json({ ok: true, selectionId: selection._id });
  } catch (err) {
    console.error('Paper selection save failed:', err.message);
    res.status(500).json({ error: 'Failed to save paper selection' });
  }
});

export default router;
