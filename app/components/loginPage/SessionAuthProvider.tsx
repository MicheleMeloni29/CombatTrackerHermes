"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCurrentSession,
  loginWithSession,
  logoutSession,
  SessionApiError,
  signupWithSession,
  type SessionUser,
} from "@/lib/sessionAuth";

interface SessionAuthContextValue {
  bootstrapError: string;
  clearBootstrapError: () => void;
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  user: SessionUser | null;
}

interface SessionAuthProviderProps {
  children: React.ReactNode;
}

interface SignupCredentials {
  username: string;
  password: string;
  confirmPassword: string;
}

const SessionAuthContext = createContext<SessionAuthContextValue | null>(null);

export default function SessionAuthProvider({
  children,
}: SessionAuthProviderProps) {
  const [bootstrapError, setBootstrapError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      try {
        const response = await getCurrentSession();
        if (!isActive) return;

        setUser(response.authenticated ? response.user : null);
      } catch {
        if (!isActive) return;
        setBootstrapError(
          "Impossibile contattare il backend. Verifica che il servizio Django sia raggiungibile."
        );
      } finally {
        if (isActive) {
          setIsReady(true);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, []);

  const clearBootstrapError = () => {
    setBootstrapError("");
  };

  const login = async (username: string, password: string) => {
    clearBootstrapError();
    const response = await loginWithSession(username, password);
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    clearBootstrapError();
    const response = await signupWithSession(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    clearBootstrapError();
    try {
      await logoutSession();
      setUser(null);
    } catch (err) {
      if (err instanceof SessionApiError) {
        throw err;
      }
      throw new Error("Logout non riuscito. Riprova.");
    }
  };

  return (
    <SessionAuthContext.Provider
      value={{
        bootstrapError,
        clearBootstrapError,
        isReady,
        login,
        logout,
        signup,
        user,
      }}
    >
      {children}
    </SessionAuthContext.Provider>
  );
}

export function useSessionAuth() {
  const ctx = useContext(SessionAuthContext);
  if (!ctx) {
    throw new Error("useSessionAuth must be used within SessionAuthProvider");
  }
  return ctx;
}
