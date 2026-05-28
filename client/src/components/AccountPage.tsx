import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarClock, ExternalLink, RefreshCw, Search } from 'lucide-react';

interface AccountPageProps {
  onBack: () => void;
  userId: string | null;
}

interface SearchHistoryItem {
  query: string;
  searchSource: 'both' | 'arxiv' | 'semantic';
  sortBy: 'relevance' | 'date' | 'citations';
  resultCount: number;
  warnings?: string[];
  createdAt: string;
}

interface SelectedPaperItem {
  id?: string;
  title: string;
  authors?: string[];
  abstract?: string;
  publishedDate?: string;
  citationCount?: number;
  url?: string;
  venue?: string;
  source?: string;
  selectedAt: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function AccountPage({ onBack, userId }: AccountPageProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selections, setSelections] = useState<SelectedPaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'searches' | 'papers'>('papers');
  const baseUrl = import.meta.env.VITE_API_URL;

  const loadHistory = useCallback(async () => {
    if (!baseUrl) {
      setError('VITE_API_URL is not configured.');
      setLoading(false);
      return;
    }
    if (!userId) {
      setError('No authenticated user found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const q = encodeURIComponent(userId);
      const [searchRes, paperRes] = await Promise.all([
        fetch(`${baseUrl}/api/account/search-history?userId=${q}&limit=50`),
        fetch(`${baseUrl}/api/account/paper-selections?userId=${q}&limit=50`),
      ]);

      const searchData = await searchRes.json();
      const paperData = await paperRes.json();

      if (!searchRes.ok) {
        throw new Error(searchData.error || 'Failed to load search history');
      }
      if (!paperRes.ok) {
        throw new Error(paperData.error || 'Failed to load selected papers');
      }

      setHistory(searchData.items ?? []);
      setSelections(paperData.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-stone-900">
      <header className="bg-white/95 backdrop-blur-lg border-b border-amber-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-stone-600 hover:text-amber-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
              <p className="text-sm text-stone-600">Your searches and selected papers</p>
            </div>
          </div>
          <button
            onClick={() => void loadHistory()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors text-stone-800 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'papers'
                ? 'bg-amber-500 text-stone-900'
                : 'bg-white border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            Selected Papers ({selections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('searches')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'searches'
                ? 'bg-amber-500 text-stone-900'
                : 'bg-white border border-amber-200 text-stone-700 hover:bg-amber-50'
            }`}
          >
            Search History ({history.length})
          </button>
        </div>

        {loading && <p className="text-stone-600">Loading your account data...</p>}
        {error && <div className="p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">{error}</div>}

        {!loading && !error && activeTab === 'papers' && (
          <>
            {selections.length === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200 p-8 text-center shadow-sm">
                <BookOpen className="w-10 h-10 mx-auto text-amber-400 mb-3" />
                <p className="text-stone-700 font-medium">No selected papers yet</p>
                <p className="text-stone-500 text-sm mt-1">
                  Click a paper in the dashboard search results to save it here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selections.map((paper, index) => (
                  <div
                    key={`${paper.id ?? paper.title}-${paper.selectedAt}-${index}`}
                    className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                      <h2 className="font-semibold text-stone-900 leading-snug pr-2">{paper.title}</h2>
                      <div className="inline-flex items-center gap-1 text-xs text-stone-500 shrink-0">
                        <CalendarClock className="w-3 h-3" />
                        Selected {formatDate(paper.selectedAt)}
                      </div>
                    </div>

                    {paper.authors && paper.authors.length > 0 && (
                      <p className="text-sm text-stone-600 mb-2">
                        {paper.authors.slice(0, 5).join(', ')}
                        {paper.authors.length > 5 ? ' et al.' : ''}
                      </p>
                    )}

                    {paper.abstract && (
                      <p className="text-sm text-stone-700 line-clamp-3 mb-3">{paper.abstract}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      {paper.source && (
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {paper.source}
                        </span>
                      )}
                      {paper.venue && (
                        <span className="px-2 py-1 rounded bg-stone-100 text-stone-700">{paper.venue}</span>
                      )}
                      {typeof paper.citationCount === 'number' && (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                          {paper.citationCount} citations
                        </span>
                      )}
                      {paper.publishedDate && (
                        <span className="px-2 py-1 rounded bg-stone-100 text-stone-700">
                          {new Date(paper.publishedDate).getFullYear() || paper.publishedDate}
                        </span>
                      )}
                    </div>

                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-amber-800 hover:text-amber-900 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open paper
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && activeTab === 'searches' && (
          <>
            {history.length === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200 p-8 text-center shadow-sm">
                <Search className="w-10 h-10 mx-auto text-amber-400 mb-3" />
                <p className="text-stone-700 font-medium">No search history yet</p>
                <p className="text-stone-500 text-sm mt-1">Search for papers from the dashboard to populate this list.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={`${item.query}-${item.createdAt}-${index}`}
                    className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <h2 className="font-semibold text-stone-900">{item.query}</h2>
                      <div className="inline-flex items-center gap-1 text-xs text-stone-500">
                        <CalendarClock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">
                        source: {item.searchSource}
                      </span>
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">sort: {item.sortBy}</span>
                      <span className="px-2 py-1 rounded bg-stone-100 text-stone-700">
                        results: {item.resultCount}
                      </span>
                    </div>
                    {item.warnings && item.warnings.length > 0 && (
                      <p className="mt-2 text-xs text-amber-700">{item.warnings.join(' ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AccountPage;
