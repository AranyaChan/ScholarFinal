import express from 'express';
import SearchHistory from '../models/SearchHistory.js';
import PaperSelection from '../models/PaperSelection.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalSearches,
      totalSelections,
      searchesLast24h,
      selectionsLast24h,
      activeUsersAgg,
      topQueries,
      recentSearches,
      recentSelections,
    ] =
      await Promise.all([
        SearchHistory.countDocuments(),
        PaperSelection.countDocuments(),
        SearchHistory.countDocuments({ createdAt: { $gte: dayAgo } }),
        PaperSelection.countDocuments({ createdAt: { $gte: dayAgo } }),
        SearchHistory.aggregate([
          { $group: { _id: '$userId' } },
          { $match: { _id: { $ne: null, $ne: '' } } },
          { $count: 'count' },
        ]),
        SearchHistory.aggregate([
          { $match: { query: { $exists: true, $ne: '' } } },
          { $group: { _id: '$query', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
          { $project: { _id: 0, query: '$_id', count: 1 } },
        ]),
        SearchHistory.find({})
          .sort({ createdAt: -1 })
          .limit(8)
          .select({ _id: 0, query: 1, searchSource: 1, createdAt: 1, userId: 1 }),
        PaperSelection.find({})
          .sort({ createdAt: -1 })
          .limit(8)
          .select({ _id: 0, 'paper.title': 1, 'paper.source': 1, createdAt: 1, userId: 1 }),
      ]);

    res.json({
      ok: true,
      totals: {
        searches: totalSearches,
        selections: totalSelections,
        activeUsers: activeUsersAgg[0]?.count ?? 0,
      },
      last24h: {
        searches: searchesLast24h,
        selections: selectionsLast24h,
      },
      topQueries,
      recentSearches,
      recentSelections: recentSelections.map((item) => ({
        title: item.paper?.title || 'Untitled paper',
        source: item.paper?.source || '',
        createdAt: item.createdAt,
        userId: item.userId,
      })),
    });
  } catch (err) {
    console.error('Admin stats failed:', err.message);
    res.status(500).json({ error: 'Failed to load admin stats' });
  }
});

export default router;
