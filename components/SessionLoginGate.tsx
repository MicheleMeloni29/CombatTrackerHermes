"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
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
  const signupUsernameId = useId();
  const signupPasswordId = useId();
  const signupConfirmPasswordId = useId();
  const errorId = useId();
  const signupErrorId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const frontFaceRef = useRef<HTMLElement | null>(null);
  const backFaceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      try {
        const response = await getCurrentSession();
        if (!isActive) return;

        setSessionUser(response.authenticated ? response.user : null);
      } catch {
        if (!isActive) return;
        setError(
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

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const updateCardHeight = () => {
      const activeFace = isSignupMode ? backFaceRef.current : frontFaceRef.current;
      if (!activeFace) return;

      const nextHeight = Math.ceil(activeFace.scrollHeight);
      setCardHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight
      );
    };

    updateCardHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateCardHeight();
    });

    if (frontFaceRef.current) {
      resizeObserver.observe(frontFaceRef.current);
    }

    if (backFaceRef.current) {
      resizeObserver.observe(backFaceRef.current);
    }

    window.addEventListener("resize", updateCardHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCardHeight);
    };
  }, [
    isSignupMode,
    error,
    signupError,
    isSubmitting,
    isSignupSubmitting,
    showPassword,
    showSignupPassword,
    showSignupConfirmPassword,
  ]);

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

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSignupSubmitting(true);
    setSignupError("");

    try {
      const response = await signupWithSession({
        username: signupUsername,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });
      setSessionUser(response.user);
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (err) {
      if (err instanceof SessionApiError) {
        setSignupError(err.message);
      } else {
        setSignupError("Creazione account non riuscita. Riprova.");
      }
    } finally {
      setIsSignupSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutSession();
      setSessionUser(null);
      setUsername("");
      setPassword("");
      setShowPassword(false);
      setSignupUsername("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setShowSignupPassword(false);
      setShowSignupConfirmPassword(false);
      setError("");
      setSignupError("");
      setIsSignupMode(false);
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
      <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-10">
        <div className="auth-card-scene mx-auto w-full max-w-lg">
          <div
            className={`auth-card-shell ${isSignupMode ? "is-flipped" : ""}`}
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <section
              ref={frontFaceRef}
              className="auth-card-face auth-card-front fantasy-card p-6 sm:p-8"
            >
              <div className="mb-6 text-center">
                
                <h1 className="mt-3 font-medieval text-3xl text-gold sm:text-4xl">
                  Login 
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-gold-dim/70">
                  Accedi per poter salvare i tuoi combattimenti e riprendere le battaglie dove le hai lascaiate
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
                      className="fantasy-input w-full px-3 py-2.5 pr-20 text-sm"
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? errorId : undefined}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-xs font-bold text-gold-dim/70 transition-colors hover:text-gold"
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Nascondi" : "Mostra"}
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
                  className="w-full rounded-md border border-gold/ bg-gold/20 px-4 py-2.5 text-sm font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30 disabled:opacity-60"
                >
                  {isSubmitting ? "Accesso..." : "Accedi"}
                </button>
              </form>

              <div className="mt-6 mb-6 rounded-lg border-2 border-border-gold bg-parchment/35 p-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsSignupMode(true);
                  }}
                  className="mt-2 text-sm font-bold text-gold transition-colors hover:text-gold-bright"
                >
                  Crea un account
                </button>
              </div>
            </section>

            <section
              ref={backFaceRef}
              className="auth-card-face auth-card-back fantasy-card p-6 sm:p-8"
            >
              <div className="mb-5 text-center">
                <h2 className="mt-3 font-medieval text-3xl text-gold sm:text-4xl">
                  Entra nella Taverna
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gold-dim/70">
                  Crea un account di test per accedere al tracker con sessione Django reale.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSignupSubmit} noValidate>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gold" htmlFor={signupUsernameId}>
                    Username
                  </label>
                  <input
                    id={signupUsernameId}
                    type="text"
                    autoComplete="username"
                    value={signupUsername}
                    onChange={(event) => setSignupUsername(event.target.value)}
                    className="fantasy-input w-full px-3 py-2.5 text-sm"
                    aria-invalid={signupError ? "true" : "false"}
                    aria-describedby={signupError ? signupErrorId : undefined}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gold" htmlFor={signupPasswordId}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id={signupPasswordId}
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      className="fantasy-input w-full px-3 py-2.5 pr-20 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-xs font-bold text-gold-dim/70 transition-colors hover:text-gold"
                      aria-label={showSignupPassword ? "Nascondi password" : "Mostra password"}
                      aria-pressed={showSignupPassword}
                    >
                      {showSignupPassword ? "Nascondi" : "Mostra"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gold" htmlFor={signupConfirmPasswordId}>
                    Conferma password
                  </label>
                  <div className="relative">
                    <input
                      id={signupConfirmPasswordId}
                      type={showSignupConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signupConfirmPassword}
                      onChange={(event) => setSignupConfirmPassword(event.target.value)}
                      className="fantasy-input w-full px-3 py-2.5 pr-20 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-xs font-bold text-gold-dim/70 transition-colors hover:text-gold"
                      aria-label={showSignupConfirmPassword ? "Nascondi password" : "Mostra password"}
                      aria-pressed={showSignupConfirmPassword}
                    >
                      {showSignupConfirmPassword ? "Nascondi" : "Mostra"}
                    </button>
                  </div>
                </div>

                {signupError && (
                  <p id={signupErrorId} className="field-error">
                    {signupError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSignupSubmitting}
                  className="w-full rounded-md border border-gold/50 bg-gold/20 px-4 py-2.5 text-sm font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30 disabled:opacity-60"
                >
                  {isSignupSubmitting ? "Creazione..." : "Crea account"}
                </button>
              </form>

              <div className="mt-6 rounded-lg border border-border-gold/20 bg-parchment/35 p-3 text-center">
                
                <button
                  type="button"
                  onClick={() => {
                    setSignupError("");
                    setIsSignupMode(false);
                  }}
                  className="mt-2 text-sm font-bold text-gold transition-colors hover:text-gold-bright"
                >
                  Torna al login
                </button>
              </div>
            </section>
          </div>
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
