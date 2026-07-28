import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase/client";

export interface SessionUser {
  id: string;
  username: string;
  email: string;
}

export interface SessionResponse {
  authenticated: boolean;
  requiresEmailConfirmation?: boolean;
  user: SessionUser | null;
}

interface SignupPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SessionApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SessionApiError";
    this.status = status;
  }
}

function toSessionUser(session: Session | null): SessionUser | null {
  const user = session?.user;
  if (!user) return null;

  const metadataUsername =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username.trim()
      : "";

  return {
    id: user.id,
    username: metadataUsername || user.email?.split("@")[0] || "Avventuriero",
    email: user.email ?? "",
  };
}

function resolveAuthError(message: string) {
  const normalized = message.toLocaleLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email o password non corretti.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Conferma l'indirizzo email prima di accedere.";
  }
  if (normalized.includes("user already registered")) {
    return "Esiste gia' un account associato a questa email.";
  }
  if (normalized.includes("password") && normalized.includes("weak")) {
    return "Scegli una password piu' sicura.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Troppi tentativi ravvicinati. Attendi qualche minuto e riprova.";
  }

  return message || "Operazione di autenticazione non riuscita.";
}

function asSessionError(error: { message: string; status?: number }) {
  return new SessionApiError(resolveAuthError(error.message), error.status ?? 400);
}

export async function getCurrentSession(): Promise<SessionResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) throw asSessionError(error);

  const user = toSessionUser(data.session);
  return {
    authenticated: Boolean(user),
    user,
  };
}

export async function loginWithSession(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw asSessionError(error);

  const user = toSessionUser(data.session);
  return {
    authenticated: Boolean(user),
    user,
  } satisfies SessionResponse;
}

export async function signupWithSession(payload: SignupPayload) {
  if (payload.password !== payload.confirmPassword) {
    throw new SessionApiError("Le password non coincidono.");
  }

  const username = payload.username.trim();
  const email = payload.email.trim();

  if (!username) {
    throw new SessionApiError("Inserisci un nome utente.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: { username },
    },
  });

  if (error) throw asSessionError(error);

  const user = toSessionUser(data.session);
  return {
    authenticated: Boolean(user),
    requiresEmailConfirmation: Boolean(data.user && !data.session),
    user,
  } satisfies SessionResponse;
}

export async function logoutSession() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) throw asSessionError(error);
}

export function subscribeToAuthChanges(
  listener: (event: AuthChangeEvent, user: SessionUser | null) => void
) {
  const supabase = getSupabaseClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    listener(event, toSessionUser(session));
  });

  return () => subscription.unsubscribe();
}
