import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./context";

const AUTH_STORAGE_KEY = "task_manager_auth";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return { token: null, user: null };
    }

    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token || null,
      user: parsed?.user || null,
    };
  } catch {
    return { token: null, user: null };
  }
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();

    return {
      token: stored.token,
      user: stored.user,
      isAuthReady: true,
    };
  });

  const persistAuth = useCallback((token, user) => {
    if (!token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token,
        user,
      })
    );
  }, []);

  const login = useCallback(
    ({ token, user }) => {
      setAuthState({
        token,
        user: user || null,
        isAuthReady: true,
      });
      persistAuth(token, user || null);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    setAuthState({
      token: null,
      user: null,
      isAuthReady: true,
    });
    persistAuth(null, null);
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.token),
      login,
      logout,
    }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
