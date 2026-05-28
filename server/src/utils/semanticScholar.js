import { axiosGetWithRetry } from './httpRetry.js';

function getSemanticScholarHeaders() {
  const key = process.env.SEMANTIC_SCHOLAR_API_KEY?.trim();
  if (!key) return {};
  return { 'x-api-key': key };
}

export function hasSemanticScholarApiKey() {
  return Boolean(process.env.SEMANTIC_SCHOLAR_API_KEY?.trim());
}

export async function fetchSemanticScholarPapers(query, maxResults = 10) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,abstract,year,venue,url,citationCount`;
  const response = await axiosGetWithRetry(url, { headers: getSemanticScholarHeaders() });
  const data = response.data;
  if (!data || !data.data) return [];
  return data.data.map((item, idx) => ({
    id: item.paperId || `semantic-${idx}`,
    title: item.title || '',
    authors: (item.authors || []).map((a) => a.name),
    abstract: item.abstract || '',
    publishedDate: item.year ? `${item.year}-01-01` : '',
    arxivId: '',
    citationCount: item.citationCount || 0,
    url: item.url || '',
    venue: item.venue || '',
    source: 'semantic',
  }));
}
