import { useState, useEffect } from 'react';
import { FileText, Zap, CheckCircle, BookOpen, Target, AlertTriangle } from 'lucide-react';
import type { Paper, Summary } from './Dashboard';

interface SummarizerAgentProps {
  paper: Paper;
  onSummaryGenerated: (summary: Summary) => void;
  existingSummary: Summary | null;
}

function SummarizerAgent({ paper, onSummaryGenerated, existingSummary }: SummarizerAgentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(existingSummary);
  const [progress, setProgress] = useState(0);

  const BASE_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    setSummary(existingSummary);
  }, [existingSummary]);

  const generateSummary = async () => {
    setIsGenerating(true);
    setProgress(0);
    try {
      // Simulate progress bar
      const steps = [20, 40, 60, 80, 100];
      for (const p of steps) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(p);
      }
      const response = await fetch(`${BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper })
      });
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
        onSummaryGenerated(data.summary);
      } else {
        setSummary(null);
      }
    } catch (error) {
      setSummary(null);
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Paper Summarization</h2>
        <p className="text-stone-600 text-lg">
          Generate comprehensive summaries using advanced NLP techniques
        </p>
      </div>

      {/* Paper Info */}
      <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Selected Paper</h3>
        <p className="text-stone-700 font-medium mb-2">{paper.title}</p>
        <p className="text-stone-500 text-sm">
          {paper.authors.join(', ')} • {new Date(paper.publishedDate).getFullYear()}
        </p>
      </div>

      {/* Action Button */}
      {!summary && (
        <div className="mb-8">
          <button
            onClick={generateSummary}
            disabled={isGenerating}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-6 h-6" />
            <span>{isGenerating ? 'Generating Summary...' : 'Generate Summary'}</span>
            {!isGenerating && <Zap className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {isGenerating && (
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-stone-800 font-medium">Analyzing Paper Content</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-stone-500 text-sm">{progress}% complete</p>
          </div>
        </div>
      )}

      {/* Summary Results */}
      {summary && !isGenerating && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle className="w-6 h-6 text-amber-700" />
            <span className="text-amber-700 font-medium">Summary Generated Successfully</span>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-stone-900">Key Findings</h3>
            </div>
            <ul className="space-y-3">
              {summary.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-stone-700 leading-relaxed">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Methodology */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-yellow-700" />
              <h3 className="text-lg font-semibold text-stone-900">Methodology</h3>
            </div>
            <p className="text-stone-700 leading-relaxed">{summary.methodology}</p>
          </div>

          {/* Implications */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-stone-900">Implications</h3>
            </div>
            <p className="text-stone-700 leading-relaxed">{summary.implications}</p>
          </div>

          {/* Limitations */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-stone-900">Limitations</h3>
            </div>
            <p className="text-stone-700 leading-relaxed">{summary.limitations}</p>
          </div>

          {/* Regenerate Button */}
          <div className="pt-4">
            <button
              onClick={generateSummary}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-amber-200 text-stone-900 rounded-lg font-medium transition-colors border border-white/20"
            >
              <FileText className="w-5 h-5" />
              <span>Regenerate Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!summary && !isGenerating && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-stone-600 text-lg mb-2">Ready to Generate Summary</p>
          <p className="text-stone-400 text-sm">
            Click the button above to create a comprehensive summary of the selected paper
          </p>
        </div>
      )}
    </div>
  );
}

export default SummarizerAgent;