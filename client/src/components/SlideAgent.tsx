import { useState, useEffect } from 'react';
import { Presentation, Download, RefreshCw, ChevronLeft, ChevronRight, Play, FileText, FileType } from 'lucide-react';
import type { Paper, Summary, Critique, Slides } from './Dashboard';
import {
  exportSlidesMarkdown,
  exportSlidesPdf,
  exportSlidesPptx,
} from '../utils/exportSlides';

interface SlideAgentProps {
  paper: Paper;
  summary: Summary;
  critique: Critique | null;
  onSlidesGenerated: (slides: Slides) => void;
  existingSlides: Slides | null;
}

function SlideAgent({ paper, summary, critique, onSlidesGenerated, existingSlides }: SlideAgentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slides | null>(existingSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState<'pptx' | 'pdf' | 'md' | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL  

  useEffect(() => {
    setSlides(existingSlides);
  }, [existingSlides]);

  const generateSlides = async () => {
    setIsGenerating(true);
    setProgress(0);
    try {
      // Simulate progress bar
      const steps = [20, 40, 60, 80, 100];
      for (const p of steps) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(p);
      }
      const response = await fetch(`${BASE_URL}/api/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper, summary, critique })
      });
      const data = await response.json();
      if (data.slides) {
        setSlides(data.slides);
        onSlidesGenerated(data.slides);
      } else {
        setSlides(null);
      }
    } catch (error) {
      setSlides(null);
    }
    setIsGenerating(false);
    setCurrentSlide(0);
  };

  const runExport = async (format: 'pptx' | 'pdf' | 'md') => {
    if (!slides || exporting) return;
    setExporting(format);
    try {
      if (format === 'md') exportSlidesMarkdown(slides, paper.title);
      else if (format === 'pdf') exportSlidesPdf(slides, paper.title);
      else await exportSlidesPptx(slides, paper.title);
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(null);
  };

  const nextSlide = () => {
    if (slides && currentSlide < slides.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Slide Generation</h2>
            <p className="text-stone-600 text-lg">
              Transform research summaries into professional presentation slides
            </p>
          </div>
          
          {slides && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-amber-50 rounded-lg p-1 border border-amber-100">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'edit' 
                      ? 'bg-amber-200 text-stone-900' 
                      : 'text-stone-500 hover:text-amber-800'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'preview' 
                      ? 'bg-amber-200 text-stone-900' 
                      : 'text-stone-500 hover:text-amber-800'
                  }`}
                >
                  Preview
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runExport('pptx')}
                  disabled={!!exporting}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-900 rounded-lg font-medium transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{exporting === 'pptx' ? '…' : 'PPTX'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runExport('pdf')}
                  disabled={!!exporting}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-stone-900 rounded-lg font-medium transition-colors text-sm"
                >
                  <FileType className="w-4 h-4" />
                  <span>{exporting === 'pdf' ? '…' : 'PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runExport('md')}
                  disabled={!!exporting}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-amber-200 disabled:opacity-50 text-stone-900 rounded-lg font-medium transition-colors border border-white/20 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>{exporting === 'md' ? '…' : 'MD'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paper Info */}
      <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Creating Slides For</h3>
        <p className="text-stone-700 font-medium mb-2">{paper.title}</p>
        <p className="text-stone-500 text-sm">
          Based on generated summary{critique ? ' and critique' : ''}
        </p>
      </div>

      {/* Action Button */}
      {!slides && (
        <div className="mb-8">
          <button
            onClick={generateSlides}
            disabled={isGenerating}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-900 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Presentation className="w-6 h-6" />
            <span>{isGenerating ? 'Generating Slides...' : 'Generate Slides'}</span>
            {!isGenerating && <Play className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {isGenerating && (
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-stone-800 font-medium">Creating Presentation Slides</span>
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

      {/* Slides Display */}
      {slides && !isGenerating && (
        <div className="space-y-6">
          {viewMode === 'edit' ? (
            // Edit Mode - Show all slides
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-stone-800 font-medium">
                  {slides.slides.length} slides generated
                </span>
                <button
                  onClick={generateSlides}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-amber-200 text-stone-900 rounded-lg font-medium transition-colors border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </div>
              
              {slides.slides.map((slide, index) => (
                <div key={index} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-stone-900">
                        Slide {index + 1}: {slide.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        slide.type === 'title' ? 'bg-amber-500/20 text-amber-700' :
                        slide.type === 'conclusion' ? 'bg-amber-500/20 text-amber-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {slide.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2">
                      {slide.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-stone-700 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Preview Mode - Show one slide at a time
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="h-full flex flex-col">
                <div className="flex-1 p-0 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
                  <div className="h-full w-full overflow-y-auto p-12">
                    {slides.slides[currentSlide].type === 'title' ? (
                      <div className="h-full flex flex-col justify-center items-center text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                          {slides.slides[currentSlide].title}
                        </h1>
                        <div className="space-y-3 text-lg text-gray-700">
                          {slides.slides[currentSlide].content.map((item, index) => (
                            <p key={index}>{item}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                          {slides.slides[currentSlide].title}
                        </h2>
                        <div className="flex-1 space-y-4">
                          {slides.slides[currentSlide].content.map((item, index) => (
                            <div key={index} className="text-lg text-gray-800 leading-relaxed">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Slide Navigation */}
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <span className="text-gray-600 font-medium">
                      {currentSlide + 1} of {slides.slides.length}
                    </span>
                    <button
                      onClick={nextSlide}
                      disabled={currentSlide === slides.slides.length - 1}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!slides && !isGenerating && (
        <div className="text-center py-12">
          <Presentation className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-stone-600 text-lg mb-2">Ready to Create Slides</p>
          <p className="text-stone-400 text-sm">
            Generate professional presentation slides from your research summary
          </p>
        </div>
      )}
    </div>
  );
}

export default SlideAgent;