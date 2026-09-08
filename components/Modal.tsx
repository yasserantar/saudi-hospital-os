"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

export default function Modal({
  children, onClose, title, size = "md",
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg";
}) {
  const isMobile = useMediaQuery(breakpoints.mobile);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

  if (isMobile) {
    // Mobile: Bottom Sheet
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="absolute bottom-0 inset-x-0 max-h-[90vh] overflow-y-auto glass-card rounded-t-2xl rounded-b-none p-5 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-royal-800/80 backdrop-blur -mx-5 px-5 py-3 border-b border-white/5">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="pb-4">{children}</div>
        </div>
      </div>
    );
  }

  // Desktop: Centered Modal
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`glass-card ${sizes[size]} w-full max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-2">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-bold text-white arabic-num">{value}</p>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold mb-2 text-teal-400">{title}</h3>
      {children}
    </div>
  );
}

export function Empty() {
  const { useT } = require("@/lib/i18n/I18nContext");
  // Will be replaced with proper translation in screens
  return <p className="text-sm text-white/40 text-center py-2">—</p>;
}
