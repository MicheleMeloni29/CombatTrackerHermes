"use client";

import HomePage from "@/app/screens/HomePage";

import SessionAuthProvider, {
  useSessionAuth,
} from "@/app/components/loginPage/SessionAuthProvider";
import LoginPage from "@/app/screens/loginPage";

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

  return user ? <HomePage /> : <HomePage />;
}
