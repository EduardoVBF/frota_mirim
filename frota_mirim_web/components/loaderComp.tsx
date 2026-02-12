"use client";
import { BeatLoader } from "react-spinners";
import React from "react";

type LoaderCompProps = {
  color?: string;
  classname?: string;
  classnameLoader?: string;
  size?: number;
  text?: string | null;
  children?: React.ReactNode;
};

export default function LoaderComp({
  color = "#2563EB",
  classname = "",
  classnameLoader = "m-2",
  size = 20,
  text = "Carregando...",
  children,
}: LoaderCompProps) {
  return (
    <div className={`flex flex-col items-center justify-center relative w-full overflow-hidden min-h-50 ${classname}`}>
      <BeatLoader
        color={color}
        className={classnameLoader}
        size={size}
        speedMultiplier={1}
      />

      {children && children}

      {text && <p className="text-muted">{text}</p>}
    </div>
  );
}
