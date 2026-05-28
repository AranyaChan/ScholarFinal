import { useState, useEffect } from 'react';
import { Search, FileText, Brain, Presentation, ArrowRight, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import AccountPage from './components/AccountPage';
import Navbar from './components/Navbar';
import AuthLoading from './components/AuthLoading';
import AuthErrorBanner from './components/AuthErrorBanner';
import { useAuthActions } from './hooks/useAuthActions';
import { isAdminUser } from './utils/isAdmin';

function App() {
  const { isLoading, isAuthenticated, error, login, signup, user } = useAuthActions();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin' | 'account'>('landing');
  const userEmail = user?.email ?? null;
  const isAdmin = isAdminUser(userEmail);

  const goToDashboard = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      login();
    }
  };

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      (currentView === 'dashboard' || currentView === 'admin' || currentView === 'account')
    ) {
      setCurrentView('landing');
    }
  }, [isLoading, isAuthenticated, currentView]);

  useEffect(() => {
    if (!isLoading && currentView === 'admin' && (!isAuthenticated || !isAdmin)) {
      setCurrentView('landing');
    }
  }, [isLoading, isAuthenticated, isAdmin, currentView]);

  const features = [
    {
      icon: Search,
      title: "Smart Paper Discovery",
      description: "Search through millions of research papers using advanced semantic search across ArXiv and Semantic Scholar."
    },
    {
      icon: FileText,  
      title: "Intelligent Summarization",
      description: "Get concise, well-structured summaries that capture the key findings and methodologies of any paper."
    },
    {
      icon: Brain,
      title: "Critical Analysis",
      description: "Receive detailed critiques evaluating methodology, novelty, potential bias, and research quality."
    },
    {
      icon: Presentation,
      title: "Instant Slide Generation",
      description: "Transform research summaries into professional presentation slides ready for sharing."
    }
  ];

  const stats = [
    { number: "10M+", label: "Research Papers" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "30s", label: "Average Processing" },
    { number: "50K+", label: "Researchers Served" }
  ];

  if (isLoading) {
    return <AuthLoading />;
  }

  if (currentView === 'dashboard' && isAuthenticated) {
    return (
      <Dashboard
        onBack={() => setCurrentView('landing')}
        userId={user?.sub ?? user?.email ?? null}
      />
    );
  }
  if (currentView === 'admin' && isAuthenticated && isAdmin && userEmail) {
    return <AdminPanel onBack={() => setCurrentView('landing')} adminEmail={userEmail} />;
  }
  if (currentView === 'account' && isAuthenticated) {
    return (
      <AccountPage
        onBack={() => setCurrentView('landing')}
        userId={user?.sub ?? user?.email ?? null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 font-roboto text-stone-900">
      <Navbar
        onGetStarted={goToDashboard}
        onAccount={() => {
          if (isAuthenticated) setCurrentView('account');
          else login();
        }}
        onAdmin={
          isAdmin
            ? () => {
                if (isAuthenticated) setCurrentView('admin');
                else login();
              }
            : undefined
        }
        onLogout={() => setCurrentView('landing')}
      />
      {error && (
        <AuthErrorBanner message={error.message} onRetryLogin={() => login()} />
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/40 to-yellow-200/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white border border-amber-200 rounded-full text-stone-700 shadow-sm text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI Technology
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
              Your AI Research
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent"> Assistant</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover, analyze, and present research papers with AI-powered intelligence. 
              From search to slides in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                type="button"
                onClick={goToDashboard}
                className="group bg-amber-500 text-stone-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition-all duration-300 flex items-center"
              >
                Start Researching
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-amber-300 text-stone-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-amber-300/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-amber-50/60 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{stat.number}</div>
                <div className="text-stone-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              Supercharge Your Research
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Our AI agents work together to streamline your entire research workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 hover:shadow-md transition-all duration-300 border border-amber-200 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-stone-900" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-amber-50/60 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Four specialized AI agents working in perfect harmony
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "SearcherAgent", desc: "Finds relevant papers using ArXiv & Semantic Scholar APIs", step: "01" },
              { icon: FileText, title: "SummarizerAgent", desc: "Creates comprehensive summaries of paper content", step: "02" },
              { icon: Brain, title: "CriticAgent", desc: "Provides critical analysis of methodology and findings", step: "03" },
              { icon: Presentation, title: "SlideAgent", desc: "Converts summaries into professional presentations", step: "04" }
            ].map((agent, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-amber-200 hover:shadow-md transition-all duration-300 shadow-sm">
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-stone-900 font-bold text-sm">
                    {agent.step}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mb-6">
                    <agent.icon className="w-6 h-6 text-stone-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-4">{agent.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{agent.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-amber-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing placeholder for nav anchor */}
      <section id="pricing" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">Pricing</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
            Start researching for free. Premium plans coming soon.
          </p>
          <button
            type="button"
            onClick={goToDashboard}
            className="bg-amber-500 text-stone-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Get Started Free
          </button>
          {!isAuthenticated && (
            <p className="text-stone-400 text-sm mt-4">
              <button type="button" onClick={() => signup()} className="underline hover:text-stone-600">
                Sign up
              </button>
              {' or '}
              <button type="button" onClick={() => login()} className="underline hover:text-stone-600">
                log in
              </button>
              {' to continue'}
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              Ready to Transform Your Research?
            </h2>
            <p className="text-xl text-stone-700 mb-10 max-w-2xl mx-auto">
              Join thousands of researchers who've accelerated their work with AI-powered assistance
            </p>
            <button 
              type="button"
              onClick={goToDashboard}
              className="group bg-white text-stone-900 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition-all duration-300 flex items-center mx-auto"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-amber-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-stone-900" />
              </div>
              <span className="text-stone-900 font-bold text-xl">ScholarAI</span>
            </div>
            <div className="text-stone-500 text-sm">
              © 2026 ScholarAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;