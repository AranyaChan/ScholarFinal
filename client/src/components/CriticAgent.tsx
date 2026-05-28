import { useState, useEffect } from 'react';
import { Brain, Star, CheckCircle, XCircle, Award, Scale } from 'lucide-react';
import type { Paper, Summary, Critique } from './Dashboard';

interface CriticAgentProps {
  paper: Paper;
  summary: Summary;
  onCritiqueGenerated: (critique: Critique) => void;
  existingCritique: Critique | null;
}

function CriticAgent({ paper, summary, onCritiqueGenerated, existingCritique }: CriticAgentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [critique, setCritique] = useState<Critique | null>(existingCritique);
  const [progress, setProgress] = useState(0);

  const BASE_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    setCritique(existingCritique);
  }, [existingCritique]);

  const generateCritique = async () => {
    setIsGenerating(true);
    setProgress(0);
    try {
      // Simulate progress bar
      const steps = [20, 40, 60, 80, 100];
      for (const p of steps) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(p);
      }
      const response = await fetch(`${BASE_URL}/api/critique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper, summary })
      });
      const data = await response.json();
      if (data.critique) {
        setCritique(data.critique);
        onCritiqueGenerated(data.critique);
      } else {
        setCritique(null);
      }
    } catch (error) {
      setCritique(null);
    }
    setIsGenerating(false);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-amber-700';
    if (rating >= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNoveltyColor = (novelty: string) => {
    switch (novelty) {
      case 'high': return 'text-amber-700 bg-amber-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getMethodologyColor = (methodology: string) => {
    switch (methodology) {
      case 'strong': return 'text-amber-700 bg-amber-500/20';
      case 'adequate': return 'text-yellow-400 bg-yellow-400/20';
      case 'weak': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Critical Analysis</h2>
        <p className="text-stone-600 text-lg">
          Comprehensive evaluation of research quality, novelty, and potential biases
        </p>
      </div>

      {/* Paper Info */}
      <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Analyzing Paper</h3>
        <p className="text-stone-700 font-medium mb-2">{paper.title}</p>
        <p className="text-stone-500 text-sm">
          {paper.authors.join(', ')} • {paper.citationCount.toLocaleString()} citations
        </p>
      </div>

      {/* Action Button */}
      {!critique && (
        <div className="mb-8">
          <button
            onClick={generateCritique}
            disabled={isGenerating}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-900 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-6 h-6" />
            <span>{isGenerating ? 'Analyzing...' : 'Generate Critique'}</span>
            {!isGenerating && <Star className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {isGenerating && (
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-stone-800 font-medium">Performing Critical Analysis</span>
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

      {/* Critique Results */}
      {critique && !isGenerating && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle className="w-6 h-6 text-yellow-700" />
            <span className="text-yellow-700 font-medium">Critical Analysis Complete</span>
          </div>

          {/* Overall Rating */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-stone-900">Overall Rating</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-3xl font-bold ${getRatingColor(critique.overallRating)}`}>
                  {critique.overallRating.toFixed(1)}
                </span>
                <span className="text-stone-500">/10</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">Novelty:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNoveltyColor(critique.novelty)}`}>
                  {critique.novelty.charAt(0).toUpperCase() + critique.novelty.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">Methodology:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodologyColor(critique.methodology)}`}>
                  {critique.methodology.charAt(0).toUpperCase() + critique.methodology.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-stone-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {critique.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-stone-700 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-stone-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {critique.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-stone-700 leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bias Analysis */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-stone-900">Bias Analysis</h3>
            </div>
            <ul className="space-y-3">
              {critique.bias.map((biasItem, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-stone-700 leading-relaxed">{biasItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regenerate Button */}
          <div className="pt-4">
            <button
              onClick={generateCritique}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-amber-200 text-stone-900 rounded-lg font-medium transition-colors border border-white/20"
            >
              <Brain className="w-5 h-5" />
              <span>Regenerate Critique</span>
            </button>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!critique && !isGenerating && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-stone-600 text-lg mb-2">Ready to Analyze Paper</p>
          <p className="text-stone-400 text-sm">
            Generate a comprehensive critique evaluating methodology, novelty, and potential biases
          </p>
        </div>
      )}
    </div>
  );
}

export default CriticAgent;