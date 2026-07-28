"use client";

interface SignupFormProps {
  confirmPassword: string;
  confirmPasswordId: string;
  email: string;
  emailId: string;
  error: string;
  errorId: string;
  isSubmitting: boolean;
  password: string;
  passwordId: string;
  setConfirmPassword: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setShowConfirmPassword: (updater: (prev: boolean) => boolean) => void;
  setShowPassword: (updater: (prev: boolean) => boolean) => void;
  setUsername: (value: string) => void;
  showConfirmPassword: boolean;
  showPassword: boolean;
  username: string;
  usernameId: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function SignupForm({
  confirmPassword,
  confirmPasswordId,
  email,
  emailId,
  error,
  errorId,
  isSubmitting,
  password,
  passwordId,
  setConfirmPassword,
  setEmail,
  setPassword,
  setShowConfirmPassword,
  setShowPassword,
  setUsername,
  showConfirmPassword,
  showPassword,
  username,
  usernameId,
  onSubmit,
}: SignupFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
          className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gold" htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 pr-20 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-border-gold/40 bg-background/70 px-2 text-xs font-bold text-gold-dim/80 transition hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Nascondi" : "Mostra"}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          className="block text-sm font-bold text-gold"
          htmlFor={confirmPasswordId}
        >
          Conferma password
        </label>
        <div className="relative">
          <input
            id={confirmPasswordId}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="fantasy-input w-full rounded-md border border-border-gold/50 bg-background/80 px-3 py-2.5 pr-20 text-sm text-foreground shadow-sm transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/70"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-md border border-border-gold/40 bg-background/70 px-2 text-xs font-bold text-gold-dim/80 transition hover:text-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
            aria-label={
              showConfirmPassword ? "Nascondi password" : "Mostra password"
            }
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? "Nascondi" : "Mostra"}
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
        {isSubmitting ? "Creazione..." : "Crea account"}
      </button>
    </form>
  );
}
