"use client";
import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ColoredTextBoxProps {
  children: React.ReactNode;
  type: "info" | "warning" | "error" | "success";
  maxWidth?: string;
  className?: string;
  showIcon?: boolean;
}

const config = {
  error: {
    icon: <AlertCircle size={18} />,
    classes: "border-2 border-error/50 bg-error/20 text-error",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    classes: "border-2 border-warning/50 bg-warning/20 text-warning",
  },
  info: {
    icon: <Info size={18} />,
    classes: "border-2 border-info/50 bg-info/20 text-info",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    classes: "border-2 border-success/50 bg-success/20 text-success",
  },
};

export default function ColoredTextBox({
  children,
  type,
  maxWidth,
  className = "",
  showIcon = true,
}: ColoredTextBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        w-full rounded-xl border p-2 flex items-start gap-1 transition-all
        ${config[type].classes} ${className}
      `}
      style={{ maxWidth }}
    >
      {showIcon && <div className="mt-0.5 shrink-0">{config[type].icon}</div>}

      <div className="text-xs md:text-sm font-medium leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}
