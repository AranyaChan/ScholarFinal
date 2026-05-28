import { useState } from 'react';
import { ArrowLeft, Search, FileText, Brain, Presentation } from 'lucide-react';
import SearchAgent from './SearchAgent';
import SummarizerAgent from './SummarizerAgent';
import CriticAgent from './CriticAgent';
import SlideAgent from './SlideAgent';

interface DashboardProps {
  onBack: () => void;
  userId: string | null;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  arxivId?: string;
  semanticScholarId?: string;
  citationCount: number;
  url: string;
  venue?: string;
}

export interface Summary {
  keyFindings: string[];
  methodology: string;
  implications: string;
  limitations: string;
}

export interface Critique {
  strengths: string[];
  weaknesses: string[];
  novelty: 'high' | 'medium' | 'low';
  methodology: 'strong' | 'adequate' | 'weak';
  bias: string[];
  overallRating: number;
}

export interface Slides {
  title: string;
  slides: Array<{
    title: string;
    content: string[];
    type: 'title' | 'content' | 'conclusion';
  }>;
}

function Dashboard({ onBack, userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'summarize' | 'critique' | 'slides'>('search');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [critique, setCritique] = useState<Critique | null>(null);
  const [slides, setSlides] = useState<Slides | null>(null);
  

  const tabs = [
    { id: 'search', label: 'Search Papers', icon: Search, color: 'from-amber-500 to-yellow-500' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'from-amber-500 to-yellow-500', disabled: !selectedPaper },
    { id: 'critique', label: 'Critique', icon: Brain, color: 'from-amber-500 to-yellow-600', disabled: !summary },
    { id: 'slides', label: 'Create Slides', icon: Presentation, color: 'from-amber-500 to-yellow-600', disabled: !summary }
  ];

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
    setSummary(null);
    setCritique(null);
    setSlides(null);
  };

  const handleSummaryGenerated = (newSummary: Summary) => {
    setSummary(newSummary);
  };

  const handleCritiqueGenerated = (newCritique: Critique) => {
    setCritique(newCritique);
  };

  const handleSlidesGenerated = (newSlides: Slides) => {
    setSlides(newSlides);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-stone-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="text-stone-600 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-stone-900">Research Dashboard</h1>
            </div>
            
            {selectedPaper && (
              <div className="hidden md:flex items-center space-x-4 text-stone-700 text-sm">
                <span>Selected: {selectedPaper.title.substring(0, 50)}...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
                  ${activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.color} text-stone-900 shadow-lg` 
                    : tab.disabled 
                      ? 'bg-amber-50 text-stone-400 cursor-not-allowed border border-amber-100'
                      : 'bg-white text-stone-700 hover:bg-amber-50 border border-amber-200'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 text-sm text-stone-500">
            <div className={`w-3 h-3 rounded-full ${selectedPaper ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
            <span>Paper Selected</span>
            <div className="w-8 h-px bg-amber-200"></div>
            <div className={`w-3 h-3 rounded-full ${summary ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
            <span>Summarized</span>
            <div className="w-8 h-px bg-amber-200"></div>
            <div className={`w-3 h-3 rounded-full ${critique ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
            <span>Critiqued</span>
            <div className="w-8 h-px bg-amber-200"></div>
            <div className={`w-3 h-3 rounded-full ${slides ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
            <span>Slides Created</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
          {activeTab === 'search' && (
            <SearchAgent
              onPaperSelect={handlePaperSelect}
              selectedPaper={selectedPaper}
              userId={userId}
            />
          )}
          
          {activeTab === 'summarize' && selectedPaper && (
            <SummarizerAgent 
              paper={selectedPaper} 
              onSummaryGenerated={handleSummaryGenerated}
              existingSummary={summary}
            />
          )}
          
          {activeTab === 'critique' && selectedPaper && summary && (
            <CriticAgent 
              paper={selectedPaper}
              summary={summary}
              onCritiqueGenerated={handleCritiqueGenerated}
              existingCritique={critique}
            />
          )}
          
          {activeTab === 'slides' && selectedPaper && summary && (
            <SlideAgent 
              paper={selectedPaper}
              summary={summary}
              critique={critique}
              onSlidesGenerated={handleSlidesGenerated}
              existingSlides={slides}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;