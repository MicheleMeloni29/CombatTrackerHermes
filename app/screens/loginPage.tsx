"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { SessionApiError } from "@/lib/sessionAuth";
import LoginForm from "../components/loginPage/LoginForm";
import SignupForm from "../components/loginPage/SignupForm";
import { useSessionAuth } from "../components/loginPage/SessionAuthProvider";

const DICE_TYPES = [
    { src: "/dice/d4.png", label: "d4" },
    { src: "/dice/d6.png", label: "d6" },
    { src: "/dice/d8.png", label: "d8" },
    { src: "/dice/d10.png", label: "d10" },
    { src: "/dice/d12.png", label: "d12" },
    { src: "/dice/d20.png", label: "d20" },
];

export default function LoginPage() {
    const usernameId = useId();
    const passwordId = useId();
    const signupUsernameId = useId();
    const signupPasswordId = useId();
    const signupConfirmPasswordId = useId();
    const errorId = useId();
    const signupErrorId = useId();
    const { bootstrapError, clearBootstrapError, login, signup } = useSessionAuth();
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

    const dice = DICE_TYPES.flatMap((type) =>
        Array.from({ length: 3 }).map((_, idx) => ({
            ...type,
            id: `${type.label}-${idx}`,
        }))
    );

    const resolveError = (err: unknown, fallback: string) =>
        err instanceof SessionApiError ? err.message : fallback;

    const clearLoginState = () => {
        setError("");
        clearBootstrapError();
    };

    const clearSignupState = () => {
        setSignupError("");
        clearBootstrapError();
    };

    const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        clearLoginState();

        try {
            await login(username, password);
            setPassword("");
        } catch (err) {
            setError(resolveError(err, "Accesso non riuscito. Riprova."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSignupSubmitting(true);
        clearSignupState();

        try {
            await signup({
                username: signupUsername,
                password: signupPassword,
                confirmPassword: signupConfirmPassword,
            });
            setSignupPassword("");
            setSignupConfirmPassword("");
        } catch (err) {
            setSignupError(resolveError(err, "Creazione account non riuscita. Riprova."));
        } finally {
            setIsSignupSubmitting(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-10">
            <img
                src="/backgrounds/loginBackground.png"
                alt="Sfondo Fantasy"
                className="pointer-events-none select-none"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    filter: "brightness(1.08) saturate(1.03)",
                    zIndex: 0,
                }}
            />
            <div
                className="pointer-events-none"
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    background:
                        "linear-gradient(to bottom, rgba(15,12,8,0.24), rgba(10,8,5,0.52))",
                }}
            />

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
                        <Image src={die.src} alt="" width={48} height={48} />
                        <span className="sr-only">{die.label}</span>
                    </span>
                ))}
            </div>

            <div className="relative z-10 mx-auto w-full max-w-lg">
                <div className="auth-card-scene">
                    <div
                        className="fantasy-card rounded-xl border-2 border-border-gold p-6 shadow-2xl backdrop-blur sm:p-8"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(26, 21, 16, 0.82), rgba(15, 12, 8, 0.86))",
                        }}
                    >
                        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border-gold/40 bg-background/60 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    clearLoginState();
                                    setIsSignupMode(false);
                                }}
                                aria-pressed={!isSignupMode}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${!isSignupMode
                                        ? "bg-gold/20 text-gold shadow"
                                        : "text-gold-dim/70 hover:text-gold"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    clearSignupState();
                                    setIsSignupMode(true);
                                }}
                                aria-pressed={isSignupMode}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${isSignupMode
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
                            <SignupForm
                                confirmPassword={signupConfirmPassword}
                                confirmPasswordId={signupConfirmPasswordId}
                                error={signupError || bootstrapError}
                                errorId={signupErrorId}
                                isSubmitting={isSignupSubmitting}
                                password={signupPassword}
                                passwordId={signupPasswordId}
                                setConfirmPassword={(value) => {
                                    clearSignupState();
                                    setSignupConfirmPassword(value);
                                }}
                                setPassword={(value) => {
                                    clearSignupState();
                                    setSignupPassword(value);
                                }}
                                setShowConfirmPassword={setShowSignupConfirmPassword}
                                setShowPassword={setShowSignupPassword}
                                setUsername={(value) => {
                                    clearSignupState();
                                    setSignupUsername(value);
                                }}
                                showConfirmPassword={showSignupConfirmPassword}
                                showPassword={showSignupPassword}
                                username={signupUsername}
                                usernameId={signupUsernameId}
                                onSubmit={handleSignupSubmit}
                            />
                        ) : (
                            <LoginForm
                                error={error || bootstrapError}
                                errorId={errorId}
                                isSubmitting={isSubmitting}
                                password={password}
                                passwordId={passwordId}
                                setPassword={(value) => {
                                    clearLoginState();
                                    setPassword(value);
                                }}
                                setShowPassword={setShowPassword}
                                setUsername={(value) => {
                                    clearLoginState();
                                    setUsername(value);
                                }}
                                showPassword={showPassword}
                                username={username}
                                usernameId={usernameId}
                                onSubmit={handleLoginSubmit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
