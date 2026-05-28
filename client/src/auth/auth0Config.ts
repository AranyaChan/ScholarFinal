/** Must match Auth0 Dashboard → Application → URLs (Callback, Logout, Web Origins). */
export const auth0Domain =
  import.meta.env.VITE_AUTH0_DOMAIN ?? 'dev-tgn3mz6286p22mv4.us.auth0.com';
export const auth0ClientId =
  import.meta.env.VITE_AUTH0_CLIENT_ID ?? 'iN2VS3Tx6XS5UPkTlwDbNowPyOL7Grvm';

export const auth0RedirectUri = window.location.origin;

export function onRedirectCallback(appState?: { returnTo?: string }) {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo ?? window.location.pathname
  );
}

/** Clears stale Auth0 transaction state (fixes intermittent "Invalid state"). */
export function clearAuth0Cache() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('@@auth0spajs@@')) {
      localStorage.removeItem(key);
    }
  }
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('@@auth0spajs@@')) {
      sessionStorage.removeItem(key);
    }
  }
}
