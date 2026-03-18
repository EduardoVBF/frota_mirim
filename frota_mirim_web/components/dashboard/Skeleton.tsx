"use client";
import React from "react";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-alternative-bg p-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-background rounded" />
        <div className="h-5 w-16 bg-background rounded" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="h-3 w-full bg-background rounded" />
    </div>
  );
}
