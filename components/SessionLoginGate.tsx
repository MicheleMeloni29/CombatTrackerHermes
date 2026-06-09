"use client";

import { createContext, useContext, useEffect, useId, useState } from "react";
import {
  getCurrentSession,
  loginWithSession,
  logoutSession,
  SessionApiError,
  type SessionUser,
} from "@/lib/sessionAuth";

interface SessionAuthContextValue {
  logout: () => Promise<void>;
  user: SessionUser | null;
}

interface SessionLoginGateProps {
  children: React.ReactNode;
}

const SessionAuthContext = createContext<SessionAuthContextValue | null>(null);

export default function SessionLoginGate({ children }: SessionLoginGateProps) {
  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      try {
        const response = await getCurrentSession();
        if (!isActive) return;

        setSessionUser(response.authenticated ? response.user : null);
      } catch {
        if (!isActive) return;
        setError("Impossibile contattare il backend. Verifica che il servizio Django sia raggiungibile.");
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginWithSession(username, password);
      setSessionUser(response.user);
      setPassword("");
    } catch (err) {
      if (err instanceof SessionApiError) {
        setError(err.message);
      } else {
        setError("Accesso non riuscito. Riprova.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutSession();
      setSessionUser(null);
      setUsername("");
      setPassword("");
      setShowPassword(false);
      setError("");
    } catch (err) {
      if (err instanceof SessionApiError) {
        setError(err.message);
      } else {
        setError("Logout non riuscito. Riprova.");
      }
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-md fantasy-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-dim/60">
              Accesso Sessione
            </p>
            <h1 className="mt-3 font-medieval text-3xl text-gold sm:text-4xl">
              Combat Tracker
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gold-dim/70">
              Accedi per salvare fino a 5 combattimenti su questo dispositivo e mantenere
              aggiornato automaticamente quello attivo.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gold" htmlFor={usernameId}>
                Username
              </label>
              <input
                id={usernameId}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="fantasy-input w-full px-3 py-2.5 text-sm"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? errorId : undefined}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gold" htmlFor={passwordId}>
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="fantasy-input w-full px-3 py-2.5 pr-12 text-sm"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? errorId : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-sm text-gold-dim/70 transition-colors hover:text-gold"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <p id={errorId} className="field-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md border border-gold/50 bg-gold/20 px-4 py-2.5 text-sm font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30"
            >
              {isSubmitting ? "Accesso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SessionAuthContext.Provider value={{ logout: handleLogout, user: sessionUser }}>
      {children}
    </SessionAuthContext.Provider>
  );
}

export function useSessionAuth() {
  const ctx = useContext(SessionAuthContext);
  if (!ctx) {
    return { logout: async () => {}, user: null };
  }
  return ctx;
}
