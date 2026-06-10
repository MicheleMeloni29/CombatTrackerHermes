"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
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
    } catch {
      setError("Logout non riuscito. Riprova.");
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!sessionUser) {
    const diceTypes = [
      { src: "/dice/d4.png", label: "d4" },
      { src: "/dice/d6.png", label: "d6" },
      { src: "/dice/d8.png", label: "d8" },
      { src: "/dice/d10.png", label: "d10" },
      { src: "/dice/d12.png", label: "d12" },
      { src: "/dice/d20.png", label: "d20" },
    ];

    const dice = diceTypes.flatMap((type) =>
      Array.from({ length: 3 }).map((_, idx) => ({
        ...type,
        id: `${type.label}-${idx}`,
      }))
    );

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-10">
        <div className="auth-dice-bg" aria-hidden="true">
          {dice.map((die, idx) => (
            <span
              key={die.id}
              className={`dice dice-${die.label}`}
              style={
                {
                  left: `${8 + ((idx * 13) % 84)}%`,
                  top: `${6 + ((idx * 19) % 78)}%`,
                  animationDelay: `${idx * -3}s`,
                  animationDuration: "16s",
                } as React.CSSProperties
              }
            >
              <img src={die.src} alt="" />
              <span className="sr-only">{die.label}</span>
            </span>
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg">
          <div className="auth-card-scene">
            <div className="fantasy-card rounded-xl border-2 border-border-gold bg-parchment/90 p-6 shadow-2xl backdrop-blur sm:p-8">
              <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border-gold/40 bg-background/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsSignupMode(false);
                  }}
                  aria-pressed={!isSignupMode}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${
                    !isSignupMode
                      ? "bg-gold/20 text-gold shadow"
                      : "text-gold-dim/70 hover:text-gold"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupError("");
                    setIsSignupMode(true);
                  }}
                  aria-pressed={isSignupMode}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${
                    isSignupMode
                      ? "bg-gold/20 text-gold shadow"
                      : "text-gold-dim/70 hover:text-gold"
                  }`}
                >
                  Registrati
                </button>
              </div>

              <div className="mb-2 text-center">
                <h1 className="font-medieval text-3xl text-gold sm:text-4xl">
                  {isSignupMode ? "Entra nella Taverna" : "Login"}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-gold-dim/70">
                  {isSignupMode
                    ? "Crea un account e preparati a combattere."
                    : "Accedi per salvare i tuoi combattimenti e riprendere le battaglie dove le hai lasciate."}
                </p>
              </div>

              {isSignupMode ? (
                <form
                  className="space-y-4"
                  onSubmit={handleSignupSubmit}
                  noValidate
                >
                  <div className="space-y-1.5">
                    <label
                      className="block text-sm font-bold text-gold"
                      htmlFor={signupUsernameId}
                    >
                      Username
                    </label>
                    <input
                      id={signupUsernameId}
                      type="text"
                      autoComplete="username"
                      value={signupUsername}
                      onChange={(event) => setSignupUsername(event.target.value)}
                      className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
                      aria-invalid={signupError ? "true" : "false"}
                      aria-describedby={signupError ? signupErrorId : undefined}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="block text-sm font-bold text-gold"
                      htmlFor={signupPasswordId}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id={signupPasswordId}
                        type={showSignupPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={signupPassword}
                        onChange={(event) =>
                          setSignupPassword(event.target.value)
                        }
                        className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 pr-20 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignupPassword((prev) => !prev)
                        }
                        className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-border-gold/40 bg-background/70 px-2 text-xs font-bold text-gold-dim/80 transition hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
                        aria-label={
                          showSignupPassword
                            ? "Nascondi password"
                            : "Mostra password"
                        }
                        aria-pressed={showSignupPassword}
                      >
                        {showSignupPassword ? "Nascondi" : "Mostra"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="block text-sm font-bold text-gold"
                      htmlFor={signupConfirmPasswordId}
                    >
                      Conferma password
                    </label>
                    <div className="relative">
                      <input
                        id={signupConfirmPasswordId}
                        type={showSignupConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={signupConfirmPassword}
                        onChange={(event) =>
                          setSignupConfirmPassword(event.target.value)
                        }
                        className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 pr-20 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignupConfirmPassword((prev) => !prev)
                        }
                        className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-border-gold/40 bg-background/70 px-2 text-xs font-bold text-gold-dim/80 transition hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
                        aria-label={
                          showSignupConfirmPassword
                            ? "Nascondi password"
                            : "Mostra password"
                        }
                        aria-pressed={showSignupConfirmPassword}
                      >
                        {showSignupConfirmPassword ? "Nascondi" : "Mostra"}
                      </button>
                    </div>
                  </div>

                  {signupError && (
                    <p
                      id={signupErrorId}
                      className="rounded-md border border-red-900/40 bg-red-900/30 px-3 py-2 text-xs text-red-200"
                    >
                      {signupError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSignupSubmitting}
                    className="w-full rounded-md border border-gold/60 bg-gold/25 px-4 py-2.5 text-sm font-bold text-gold transition hover:border-gold hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSignupSubmitting ? "Creazione..." : "Crea account"}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-1.5">
                    <label
                      className="block text-sm font-bold text-gold"
                      htmlFor={usernameId}
                    >
                      Username
                    </label>
                    <input
                      id={usernameId}
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? errorId : undefined}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="block text-sm font-bold text-gold"
                      htmlFor={passwordId}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id={passwordId}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 pr-20 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? errorId : undefined}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-border-gold/40 bg-background/70 px-2 text-xs font-bold text-gold-dim/80 transition hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
                        aria-label={
                          showPassword ? "Nascondi password" : "Mostra password"
                        }
                        aria-pressed={showPassword}
                      >
                        {showPassword ? "Nascondi" : "Mostra"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p
                      id={errorId}
                      className="rounded-md border border-red-900/40 bg-red-900/30 px-3 py-2 text-xs text-red-200"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md border border-gold/60 bg-gold/25 px-4 py-2.5 text-sm font-bold text-gold transition hover:border-gold hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Accesso..." : "Accedi"}
                  </button>
                </form>
              )}
            </div>
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
