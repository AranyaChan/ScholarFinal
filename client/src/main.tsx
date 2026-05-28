import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.tsx';
import {
  auth0ClientId,
  auth0Domain,
  auth0RedirectUri,
  onRedirectCallback,
} from './auth/auth0Config';

createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    authorizationParams={{ redirect_uri: auth0RedirectUri }}
    cacheLocation="localstorage"
    useRefreshTokens={true}
    useRefreshTokensFallback={true}
    onRedirectCallback={onRedirectCallback}
  >
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  </Auth0Provider>
);
