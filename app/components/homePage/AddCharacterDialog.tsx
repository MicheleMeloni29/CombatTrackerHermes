"use client";

import { useEffect } from "react";
import type { CharacterInput } from "@/types/character";
import CharacterForm from "./CharacterForm";

interface AddCharacterDialogProps {
  isOpen: boolean;
  onAdd: (character: CharacterInput) => void;
  onClose: () => void;
}

export default function AddCharacterDialog({
  isOpen,
  onAdd,
  onClose,
}: AddCharacterDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-black/70 px-2 pb-2 pt-8 backdrop-blur-sm sm:items-center sm:px-4 sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-label="Aggiungi combattente"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Chiudi aggiunta combattente"
      />
      <div className="relative max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] sm:rounded-[1.75rem]">
        <CharacterForm onAdd={onAdd} onCancel={onClose} />
      </div>
    </div>
  );
}
