"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrimaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function PrimaryModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: PrimaryModalProps) {
  
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-6">
          {/* Overlay com desfoque mais intenso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // onClick={onClose} // Esta linha foi comentada para evitar que o clique no overlay feche o modal
            className="absolute inset-0 bg-background/50 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} bg-background border-2 border-border/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-4xl overflow-hidden flex flex-col`}
          >
            {/* Botão Fechar Flutuante */}
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-alternative-bg border border-border text-muted hover:text-accent hover:border-accent/50 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {/* Header Integrado ao Conteúdo */}
              <header className="mb-3">
                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-muted font-medium mt-2 max-w-[80%]">
                    {description}
                  </p>
                )}
                <div className="h-1 w-1/4 bg-accent mt-2 rounded-full" />
              </header>

              {/* Área de Conteúdo */}
              <main>
                {children}
              </main>

              {/* Footer */}
              {footer && (
                <footer className="mt-8 flex items-center justify-end gap-4">
                  {footer}
                </footer>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}