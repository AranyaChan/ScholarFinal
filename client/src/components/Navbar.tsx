import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuthActions } from '../hooks/useAuthActions';
import AuthErrorBanner from './AuthErrorBanner';

interface NavbarProps {
  onGetStarted?: () => void;
  onAccount?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

function Navbar({ onGetStarted, onAccount, onAdmin, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, login, signup, logout, user, error } = useAuthActions();

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#pricing', label: 'Pricing' },
  ];

  const handleLogin = () => {
    login();
    setMobileOpen(false);
  };

  const handleSignup = () => {
    signup();
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <AuthErrorBanner message={error.message} onRetryLogin={login} />
        )}
        <div className="flex justify-between items-center py-4">
          <a href="#" className="flex items-center space-x-2 shrink-0">
            <img
              src="/Logo.png"
              alt="ScholarAI logo"
              className="w-9 h-9 rounded-lg object-contain"
            />
            <span className="text-stone-900 font-bold text-xl">ScholarAI</span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-stone-700 hover:text-amber-800 transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-stone-600 text-sm truncate max-w-[140px]">
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-stone-700 hover:text-amber-800 transition-colors text-sm font-medium"
                >
                  Log out
                </button>
                {onGetStarted && (
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="bg-amber-500 text-stone-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                {onAccount && (
                  <button
                    type="button"
                    onClick={onAccount}
                    className="px-4 py-2 rounded-lg font-semibold border border-amber-300 text-stone-800 hover:bg-amber-50 transition-colors"
                  >
                    Account
                  </button>
                )}
                {onAdmin && (
                  <button
                    type="button"
                    onClick={onAdmin}
                    className="px-4 py-2 rounded-lg font-semibold border border-amber-300 text-stone-800 hover:bg-amber-50 transition-colors"
                  >
                    Admin
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-stone-700 hover:text-amber-800 transition-colors text-sm font-medium px-2"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="bg-amber-500 text-stone-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-stone-800 p-2 rounded-lg hover:bg-amber-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-amber-100 pt-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-stone-700 hover:text-amber-800 transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <p className="text-stone-500 text-sm py-1">{user?.name}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left text-stone-700 hover:text-amber-800 py-2"
                >
                  Log out
                </button>
                {onGetStarted && (
                  <button
                    type="button"
                    onClick={() => {
                      onGetStarted();
                      setMobileOpen(false);
                    }}
                    className="w-full bg-amber-500 text-stone-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                {onAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onAccount();
                      setMobileOpen(false);
                    }}
                    className="w-full border border-amber-300 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                  >
                    Account
                  </button>
                )}
                {onAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onAdmin();
                      setMobileOpen(false);
                    }}
                    className="w-full border border-amber-300 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                  >
                    Admin
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full text-stone-700 hover:text-amber-800 py-2 text-left font-medium"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="w-full bg-amber-500 text-stone-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
