"use client";

import { useEffect } from "react";
import Icon from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mt-sm sm:hidden" />
        <div className="p-lg max-h-[88vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-xl font-bold text-on-surface">{title}</h2>
            <button onClick={onClose} className="p-xs rounded-full hover:bg-surface-container transition-colors">
              <Icon name="close" className="text-on-surface-variant" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
