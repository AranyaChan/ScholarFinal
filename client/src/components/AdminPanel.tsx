import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, Clock3, Database, RefreshCw, Search, Users } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
  adminEmail: string;
}

interface AdminStatsResponse {
  ok: boolean;
  totals: {
    searches: number;
    selections: number;
    activeUsers: number;
  };
  last24h: {
    searches: number;
    selections: number;
  };
  topQueries?: Array<{ query: string; count: number }>;
  recentSearches?: Array<{ query: string; searchSource: string; createdAt: string; userId?: string | null }>;
  recentSelections?: Array<{ title: string; source: string; createdAt: string; userId?: string | null }>;
}

function formatTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function AdminPanel({ onBack, adminEmail }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [health, setHealth] = useState<{ ok?: boolean; dbConnected?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_URL;

  const load = useCallback(async () => {
    if (!baseUrl) {
      setError('VITE_API_URL is not configured.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const emailParam = encodeURIComponent(adminEmail);
      const [statsRes, healthRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/stats?email=${emailParam}`),
        fetch(`${baseUrl}/api/health`),
      ]);

      const statsData = await statsRes.json();
      const healthData = await healthRes.json();

      if (!statsRes.ok) {
        throw new Error(statsData.error || 'Failed to load admin stats');
      }

      setStats(statsData);
      setHealth(healthData);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, adminEmail]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = useMemo(
    () => [
      {
        label: 'Total Searches',
        value: stats?.totals.searches ?? 0,
        icon: Search,
        accent: 'from-amber-400 to-yellow-500',
      },
      {
        label: 'Paper Selections',
        value: stats?.totals.selections ?? 0,
        icon: Activity,
        accent: 'from-yellow-400 to-amber-500',
      },
      {
        label: 'Active Users',
        value: stats?.totals.activeUsers ?? 0,
        icon: Users,
        accent: 'from-amber-500 to-orange-400',
      },
      {
        label: 'DB Connected',
        value: health?.dbConnected ? 'Yes' : 'No',
        icon: Database,
        accent: health?.dbConnected ? 'from-green-400 to-emerald-500' : 'from-red-400 to-rose-500',
      },
    ],
    [stats, health]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-stone-900">
      <header className="bg-white/95 backdrop-blur-lg border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-stone-600 hover:text-amber-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
              <p className="text-sm text-stone-600">Usage analytics and backend health snapshot</p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors text-stone-800 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-stone-600">Loading admin dashboard...</p>}
        {error && <div className="p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-stone-600">{card.label}</p>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.accent} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5 text-stone-900" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-stone-900">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
                <h2 className="font-semibold text-stone-900 mb-4">Last 24 Hours</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Searches</span>
                    <span className="font-medium text-stone-900">{stats?.last24h.searches ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Selections</span>
                    <span className="font-medium text-stone-900">{stats?.last24h.selections ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">API Health</span>
                    <span className={`font-medium ${health?.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                      {health?.ok ? 'Healthy' : 'Unhealthy'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm xl:col-span-2">
                <h2 className="font-semibold text-stone-900 mb-4">Top Queries</h2>
                <div className="space-y-2">
                  {(stats?.topQueries ?? []).length === 0 && (
                    <p className="text-sm text-stone-500">No query data yet.</p>
                  )}
                  {(stats?.topQueries ?? []).map((q) => (
                    <div key={q.query} className="flex items-center justify-between text-sm border border-amber-100 rounded-lg px-3 py-2">
                      <span className="text-stone-700 truncate pr-3">{q.query}</span>
                      <span className="font-semibold text-stone-900">{q.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
                <h2 className="font-semibold text-stone-900 mb-4">Recent Searches</h2>
                <div className="space-y-2 max-h-80 overflow-auto pr-1">
                  {(stats?.recentSearches ?? []).length === 0 && (
                    <p className="text-sm text-stone-500">No searches logged yet.</p>
                  )}
                  {(stats?.recentSearches ?? []).map((item, idx) => (
                    <div key={`${item.query}-${idx}`} className="border border-amber-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.query}</p>
                      <p className="text-xs text-stone-600 mt-1">
                        source: {item.searchSource} · user: {item.userId || 'guest'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">{formatTime(item.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
                <h2 className="font-semibold text-stone-900 mb-4">Recent Paper Selections</h2>
                <div className="space-y-2 max-h-80 overflow-auto pr-1">
                  {(stats?.recentSelections ?? []).length === 0 && (
                    <p className="text-sm text-stone-500">No paper selections logged yet.</p>
                  )}
                  {(stats?.recentSelections ?? []).map((item, idx) => (
                    <div key={`${item.title}-${idx}`} className="border border-amber-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                      <p className="text-xs text-stone-600 mt-1">
                        source: {item.source || 'unknown'} · user: {item.userId || 'guest'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">{formatTime(item.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-stone-500">
              <Clock3 className="w-3 h-3" />
              <span>Last updated: {formatTime(lastUpdated)}</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
