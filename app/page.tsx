"use client";

import HomePage from "@/app/screens/HomePage";
import LoginPage from "@/app/screens/LoginPage";
import SessionAuthProvider, {
  useSessionAuth,
} from "@/app/components/loginPage/SessionAuthProvider";

export default function Home() {
  return (
    <SessionAuthProvider>
      <PageNavigator />
    </SessionAuthProvider>
  );
}

function PageNavigator() {
  const { isReady, user } = useSessionAuth();

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  return user ? <HomePage /> : <LoginPage />;
}
