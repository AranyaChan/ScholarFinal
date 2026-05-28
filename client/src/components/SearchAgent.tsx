import React, { useState } from 'react';
import { Search, ExternalLink, Calendar, Users, Star, BookOpen, Filter, SortAsc } from 'lucide-react';
import type { Paper } from './Dashboard';

interface SearchAgentProps {
  onPaperSelect: (paper: Paper) => void;
  selectedPaper: Paper | null;
  userId: string | null;
}

function SearchAgent({ onPaperSelect, selectedPaper, userId }: SearchAgentProps) {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'both' | 'arxiv' | 'semantic'>('both');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const searchPapers = async () => {
    if (!query.trim()) return;
    if (!BASE_URL) {
      setSearchError('API URL not configured. Set VITE_API_URL in client/.env and restart the dev server.');
      return;
    }
    setIsLoading(true);
    setSearchError(null);
    setSearchWarning(null);
    try {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchSource, sortBy, userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPapers([]);
        setSearchError(data.details || data.error || 'Search failed. Is the backend running on port 5000?');
        return;
      }
      setPapers(data.papers || []);
      if (data.warnings?.length) {
        setSearchWarning(data.warnings.join(' '));
      }
    } catch {
      setPapers([]);
      setSearchError('Could not reach the server. Start the backend with: cd ScholarAI/server && npm run dev');
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPapers();
  };

  const handlePaperClick = async (paper: Paper) => {
    onPaperSelect(paper);

    if (!BASE_URL) return;

    try {
      await fetch(`${BASE_URL}/api/paper/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, paper }),
      });
    } catch {
      // Non-blocking analytics write; ignore failures.
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Search Research Papers</h2>
        <p className="text-stone-600 text-lg">
          Find relevant papers from ArXiv and Semantic Scholar using advanced semantic search
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research query (e.g., 'attention mechanisms in NLP', 'quantum computing algorithms')"
              className="w-full px-4 py-3 rounded-lg bg-white border border-amber-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 rounded-lg font-medium hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Search Options */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value as any)}
              className="bg-white border border-amber-200 text-stone-900 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <div className='bg-white/10 text-black'>
              <option value="both">Both Sources</option>
              <option value="arxiv">ArXiv Only</option>
              <option value="semantic">Semantic Scholar Only</option>
              </div>  
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-amber-200 text-stone-900 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <div className='text-black'>
              <option value="relevance">Relevance</option>
              <option value="date">Publication Date</option>
              <option value="citations">Citation Count</option>
              </div>
            </select>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600">Searching research papers...</p>
        </div>
      )}

      {searchError && !isLoading && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400/40 text-red-800 text-sm">
          {searchError}
        </div>
      )}

      {searchWarning && !isLoading && papers.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-100 text-sm">
          {searchWarning}
        </div>
      )}

      {/* Results */}
      {papers.length > 0 && !isLoading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-stone-900">
              {papers.length} papers found
            </h3>
          </div>

          <div className="grid gap-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className={`
                  bg-white rounded-xl p-6 border transition-all duration-300 cursor-pointer shadow-sm
                  ${selectedPaper?.id === paper.id 
                    ? 'border-amber-500 bg-amber-100' 
                    : 'border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                  }
                `}
                onClick={() => handlePaperClick(paper)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-stone-900 mb-2 leading-snug">
                      {paper.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(paper.publishedDate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{paper.citationCount.toLocaleString()} citations</span>
                      </div>
                      
                      {paper.venue && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{paper.venue}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-stone-700 text-sm leading-relaxed mb-4">
                      {paper.abstract}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-amber-200 rounded-lg text-stone-700 hover:text-amber-800 transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Paper</span>
                    </a>
                    
                    {selectedPaper?.id === paper.id && (
                      <div className="px-4 py-2 bg-amber-500/20 border border-amber-400 rounded-lg text-amber-800 text-sm text-center">
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {papers.length === 0 && !isLoading && query && !searchError && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-stone-600">No papers found for your query. Try different keywords or switch to &quot;ArXiv Only&quot;.</p>
        </div>
      )}

      {/* Initial State */}
      {papers.length === 0 && !isLoading && !query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-stone-600 text-lg">Enter a search query to find research papers</p>
          <p className="text-stone-400 text-sm mt-2">
            Try searching for topics like "machine learning", "quantum computing", or "climate change"
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchAgent;