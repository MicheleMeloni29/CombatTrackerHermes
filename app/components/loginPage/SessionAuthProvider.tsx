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
      console.info("[auth]", "Session bootstrap start");

      try {
        const response = await getCurrentSession();
        if (!isActive) return;

        setUser(response.authenticated ? response.user : null);
        console.info("[auth]", "Session bootstrap success", {
          authenticated: response.authenticated,
          userId: response.user?.id ?? null,
          username: response.user?.username ?? null,
        });
      } catch (error) {
        if (!isActive) return;
        console.error("[auth]", "Session bootstrap failed", {
          error: error instanceof Error ? error.message : String(error),
        });
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
    console.info("[auth]", "Session provider login start", {
      username,
    });

    try {
      const response = await loginWithSession(username, password);
      setUser(response.user);
      console.info("[auth]", "Session provider login success", {
        userId: response.user?.id ?? null,
        username: response.user?.username ?? null,
      });
    } catch (error) {
      console.error("[auth]", "Session provider login failed", {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    clearBootstrapError();
    console.info("[auth]", "Session provider signup start", {
      username: credentials.username,
    });

    try {
      const response = await signupWithSession(credentials);
      setUser(response.user);
      console.info("[auth]", "Session provider signup success", {
        userId: response.user?.id ?? null,
        username: response.user?.username ?? null,
      });
    } catch (error) {
      console.error("[auth]", "Session provider signup failed", {
        username: credentials.username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const logout = async () => {
    clearBootstrapError();
    console.info("[auth]", "Session provider logout start");
    try {
      await logoutSession();
      setUser(null);
      console.info("[auth]", "Session provider logout success");
    } catch (err) {
      console.error("[auth]", "Session provider logout failed", {
        error: err instanceof Error ? err.message : String(err),
      });
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
