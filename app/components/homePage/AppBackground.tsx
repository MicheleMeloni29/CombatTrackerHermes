"use client";

export default function AppBackground() {
  return (
    <div className="combat-app-background" aria-hidden="true">
      <div className="combat-app-background__vignette" />
      <div className="combat-app-background__grid" />
      <div className="combat-app-background__sweep" />
      <div className="combat-app-background__embers" />
      <div className="combat-app-background__sigil combat-app-background__sigil--one" />
      <div className="combat-app-background__sigil combat-app-background__sigil--two" />
    </div>
  );
}
