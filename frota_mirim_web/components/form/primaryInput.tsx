"use client";
import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrimaryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function PrimaryInput({
  label,
  type = "text",
  error,
  className = "",
  disabled = false,
  ...props
}: PrimaryInputProps) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className} w-full`}>
      {/* Label e Erro */}
      <div className="flex justify-between items-end px-1">
        <label className="text-[11px] font-bold uppercase tracking-widest text-muted/80">
          {label}
          {props.required && <span className="text-accent ml-1">*</span>}
        </label>
        
        <AnimatePresence>
          {error && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-[10px] font-bold text-error flex items-center gap-1"
            >
              <AlertCircle size={12} /> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative group">
        <input
          {...props}
          disabled={disabled}
          type={isPassword && showPassword ? "text" : type}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200
            bg-alternative-bg border outline-none
            placeholder:text-muted/40 text-foreground
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused 
              ? "border-accent ring-4 ring-accent/5 shadow-sm" 
              : "border-border hover:border-border-hover"
            }
            ${error ? "border-error/50 bg-error/5 focus:ring-error/5" : ""}
            ${isPassword ? "pr-11" : ""}
          `}
        />

        {/* Toggle de Senha */}
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`
              absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
              transition-colors duration-200
              ${isFocused || showPassword ? "text-accent" : "text-muted hover:text-foreground"}
            `}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}