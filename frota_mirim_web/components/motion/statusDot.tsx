"use client";
import { motion } from "framer-motion";

export const StatusDot = ({ color = "var(--success)" }: { color?: string }) => (
  <span className="relative flex h-3 w-3">
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ backgroundColor: color }}
    />
    <span 
      className="relative inline-flex rounded-full h-3 w-3" 
      style={{ backgroundColor: color }} 
    />
  </span>
);