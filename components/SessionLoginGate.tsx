"use client";

import { createContext, useContext, useEffect, useId, useState } from "react";

const SESSION_AUTH_KEY = "combat-tracker.auth";
const VALID_USERNAME = "Ebrez";
const VALID_PASSWORD = "CDS71";

interface SessionAuthContextValue {
  logout: () => void;
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
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frameId = window.requestAnimationFrame(() => {
      const raw = window.sessionStorage.getItem(SESSION_AUTH_KEY);

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { username?: string } | null;
          setIsAuthenticated(parsed?.username === VALID_USERNAME);
        } catch {
          window.sessionStorage.removeItem(SESSION_AUTH_KEY);
        }
      }

      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      window.sessionStorage.setItem(
        SESSION_AUTH_KEY,
        JSON.stringify({ username: VALID_USERNAME, authenticatedAt: Date.now() })
      );
      setError("");
      setIsAuthenticated(true);
      setPassword("");
      return;
    }

    setError("Credenziali non valide. Controlla username e password.");
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
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
              Accedi per salvare fino a 5 combattimenti nella sessione e mantenere aggiornato
              automaticamente quello attivo.
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
              className="w-full rounded-md border border-gold/50 bg-gold/20 px-4 py-2.5 text-sm font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SessionAuthContext.Provider value={{ logout: handleLogout }}>
      {children}
    </SessionAuthContext.Provider>
  );
}

export function useSessionAuth() {
  const ctx = useContext(SessionAuthContext);
  if (!ctx) {
    return { logout: () => {} };
  }
  return ctx;
}
