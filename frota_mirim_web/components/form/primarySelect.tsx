"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  value: string;
  label: string;
}

interface PrimarySelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PrimarySelect({
  label,
  value,
  options,
  error,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
  disabled = false,
  required = false,
}: PrimarySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`flex flex-col gap-1.5 ${className} w-full`} ref={containerRef}>
      {/* Label e Erro */}
      <div className="flex justify-between items-end px-1">
        <label className="text-[11px] font-bold uppercase tracking-widest text-muted/80">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
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

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between
            bg-alternative-bg border outline-none text-left
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen 
              ? "border-accent ring-4 ring-accent/5 shadow-sm" 
              : "border-border hover:border-border-hover"
            }
            ${error ? "border-error/50 bg-error/5" : ""}
          `}
        >
          <span className={selectedOption ? "text-foreground" : "text-muted/60"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : "text-muted"}`} 
          />
        </button>

        {/* Lista de Opções Customizada */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.ul
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 w-full bg-background backdrop-blur-xl border border-accent shadow-xl rounded-xl overflow-hidden py-1.5 px-2"
            >
              {options.length > 0 ? (
                options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full px-4 py-2 text-sm rounded-xl flex items-center justify-between transition-colors
                        ${value === option.value 
                          ? "bg-accent/10 text-accent font-bold" 
                          : "text-foreground hover:bg-foreground/10 hover:text-accent"
                        }
                      `}
                    >
                      {option.label}
                      {value === option.value && <Check size={14} />}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-xs text-muted text-center italic">
                  Nenhuma opção disponível
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}