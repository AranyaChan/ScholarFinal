import express from 'express';
const router = express.Router();

// POST /api/search

// Accepts: { query: string, searchSource: 'both' | 'arxiv' | 'semantic', sortBy: 'relevance' | 'date' | 'citations' }
import axios from 'axios';
import { axiosGetWithRetry } from '../utils/httpRetry.js';
import {
  fetchSemanticScholarPapers,
  hasSemanticScholarApiKey,
} from '../utils/semanticScholar.js';
import SearchHistory from '../models/SearchHistory.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const arxivHeaders = () => ({
  'User-Agent':
    process.env.ARXIV_USER_AGENT ||
    'ScholarAI/1.0 (https://github.com/AranyaChan/ScholarAi; mailto:contact@example.com)',
});

router.post('/', async (req, res) => {
  
  const { query, searchSource = 'both', sortBy = 'relevance', userId = null } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query' });
  }

  let papers = [];
  const warnings = [];

  // Fetch from arXiv if needed
  if (searchSource === 'arxiv' || searchSource === 'both') {
    try {
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
      const response = await axiosGetWithRetry(arxivUrl, { headers: arxivHeaders() });
      const xml = response.data;
      const parseString = (await import('xml2js')).parseStringPromise;
      const result = await parseString(xml);
      const rawEntries = result.feed?.entry;
      const entries = rawEntries ? (Array.isArray(rawEntries) ? rawEntries : [rawEntries]) : [];
      const getString = (val) => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object' && '_' in val) return val._;
        return '';
      };
      const arxivPapers = entries.map((entry, idx) => ({
        id: getString(entry.id?.[0]) || `arxiv-${idx}`,
        title: getString(entry.title?.[0]).replace(/\s+/g, ' ').trim() || '',
        authors: entry.author?.map((a) => getString(a.name[0])) || [],
        abstract: getString(entry.summary?.[0]).replace(/\s+/g, ' ').trim() || '',
        publishedDate: getString(entry.published?.[0]) || '',
        arxivId: getString(entry.id?.[0]).split('/abs/')[1] || '',
        citationCount: 0,
        url: getString(entry.id?.[0]) || '',
        venue: getString(entry['arxiv:journal_ref']?.[0]) || '',
        source: 'arxiv',
      }));
      papers = papers.concat(arxivPapers);
    } catch (err) {
      const msg =
        err.response?.status === 429
          ? 'arXiv rate limit — wait 1–2 minutes between searches, or try again later.'
          : err.message;
      console.error('arXiv search failed:', msg);
      warnings.push(`arXiv: ${msg}`);
    }
  }

  if (searchSource === 'both') {
    await sleep(3000);
  }

  // Fetch from Semantic Scholar if needed
  if (searchSource === 'semantic' || searchSource === 'both') {
    try {
      const semanticPapers = await fetchSemanticScholarPapers(query, 10);
      papers = papers.concat(semanticPapers);
    } catch (err) {
      const status = err.response?.status;
      let msg = err.message;
      if (status === 401) {
        msg = 'Invalid SEMANTIC_SCHOLAR_API_KEY — check the key in server/.env and restart the server.';
      } else if (status === 429) {
        msg = hasSemanticScholarApiKey()
          ? 'Semantic Scholar rate limit reached. Wait a minute and try again.'
          : 'Semantic Scholar rate limit reached. Add SEMANTIC_SCHOLAR_API_KEY to server/.env and restart.';
      }
      console.error('Semantic Scholar search failed:', msg);
      warnings.push(`Semantic Scholar: ${msg}`);
    }
  }

  if (papers.length === 0) {
    void SearchHistory.create({
      userId,
      query,
      searchSource,
      sortBy,
      resultCount: 0,
      warnings,
    }).catch(() => {});

    return res.status(502).json({
      error: 'No papers found from any source',
      details: warnings.length ? warnings.join(' ') : 'Try different keywords or another source.',
      warnings,
      papers: [],
    });
  }

  if (sortBy === 'date') {
    papers.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  } else if (sortBy === 'citations') {
    papers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
  }

  void SearchHistory.create({
    userId,
    query,
    searchSource,
    sortBy,
    resultCount: papers.length,
    warnings,
  }).catch(() => {});

  res.json({ papers, warnings: warnings.length ? warnings : undefined });
});

export default router;
