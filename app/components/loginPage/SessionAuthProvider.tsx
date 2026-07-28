"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginWithSession,
  logoutSession,
  SessionApiError,
  signupWithSession,
  subscribeToAuthChanges,
  type SessionUser,
} from "@/lib/sessionAuth";

interface SignupResult {
  requiresEmailConfirmation: boolean;
}

interface SessionAuthContextValue {
  bootstrapError: string;
  clearBootstrapError: () => void;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<SignupResult>;
  user: SessionUser | null;
}

interface SessionAuthProviderProps {
  children: React.ReactNode;
}

interface SignupCredentials {
  username: string;
  email: string;
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
    let unsubscribe = () => {};
    const readyFallbackId = window.setTimeout(() => {
      if (isActive) setIsReady(true);
    }, 1500);

    try {
      unsubscribe = subscribeToAuthChanges((event, nextUser) => {
        if (!isActive) return;

        setUser(nextUser);
        if (event === "INITIAL_SESSION") {
          window.clearTimeout(readyFallbackId);
          setIsReady(true);
        }
      });
    } catch (error) {
      window.clearTimeout(readyFallbackId);
      const message =
        error instanceof Error
          ? error.message
          : "Impossibile inizializzare Supabase. Riprova.";

      window.setTimeout(() => {
        if (!isActive) return;
        setBootstrapError(message);
        setIsReady(true);
      }, 0);
    }

    return () => {
      isActive = false;
      window.clearTimeout(readyFallbackId);
      unsubscribe();
    };
  }, []);

  const clearBootstrapError = () => {
    setBootstrapError("");
  };

  const login = async (email: string, password: string) => {
    clearBootstrapError();

    try {
      const response = await loginWithSession(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    clearBootstrapError();

    try {
      const response = await signupWithSession(credentials);
      setUser(response.user);
      return {
        requiresEmailConfirmation: Boolean(response.requiresEmailConfirmation),
      };
    } catch (error) {
      throw error;
    }
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
