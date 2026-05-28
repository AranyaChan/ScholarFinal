import { useAuth0 } from '@auth0/auth0-react';

/** Auth0 login / signup / logout — same flow as Auth0 quickstart module. */
export function useAuthActions() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const loginOptions = { appState: { returnTo: window.location.pathname } };

  const signup = () =>
    login({
      ...loginOptions,
      authorizationParams: { screen_hint: 'signup' },
    });

  const loginWithReturn = () => login(loginOptions);

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  return {
    isLoading,
    isAuthenticated,
    error,
    login: loginWithReturn,
    signup,
    logout,
    user,
  };
}
