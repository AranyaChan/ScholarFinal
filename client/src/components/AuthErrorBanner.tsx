import { clearAuth0Cache } from '../auth/auth0Config';

interface AuthErrorBannerProps {
  message: string;
  onRetryLogin: () => void;
}

function AuthErrorBanner({ message, onRetryLogin }: AuthErrorBannerProps) {
  const isInvalidState =
    message.toLowerCase().includes('invalid state') ||
    message.toLowerCase().includes('missing_transaction');

  const handleClearAndRetry = () => {
    clearAuth0Cache();
    onRetryLogin();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="text-red-800 text-sm bg-red-50 border border-red-300 rounded-lg px-4 py-3 space-y-2">
        <p>Error: {message}</p>
        {isInvalidState && (
          <>
            <p className="text-red-700 text-xs">
              Usually caused by a stale login redirect, multiple tabs, or using localhost vs
              127.0.0.1. Use one URL only (e.g. http://localhost:5173).
            </p>
            <button
              type="button"
              onClick={handleClearAndRetry}
              className="text-stone-900 bg-red-600/80 hover:bg-red-600 px-4 py-1.5 rounded-md text-xs font-medium"
            >
              Clear session & try log in again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthErrorBanner;
