"use client";
import React from "react";
import { motion } from "framer-motion";

interface PrimarySwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function PrimarySwitch({
  label,
  checked,
  error,
  onChange,
  disabled = false,
  className = "",
}: PrimarySwitchProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-3">
        <label className="text-[11px] font-bold uppercase tracking-widest text-muted/80 cursor-pointer select-none"
               onClick={() => !disabled && onChange(!checked)}>
          {label}
        </label>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          disabled={disabled}
          className={`
            relative w-11 h-6 flex items-center rounded-full px-1 transition-colors duration-300
            ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
            ${checked ? "bg-accent" : "border border-accent bg-transparent"}
          `}
        >
          <motion.span
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className={`
              w-4 h-4 rounded-full shadow-sm
              ${checked ? "ml-auto bg-background" : "ml-0 bg-accent"}
            `}
          />
        </button>
      </div>

      {error && (
        <p className="text-[10px] font-bold text-error px-1 uppercase tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}