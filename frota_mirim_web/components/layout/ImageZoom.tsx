"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  zoom?: boolean;
  fill?: boolean;
  primaryImageClassName?: string;
}

export default function ImageZoom({
  src,
  alt = "",
  width = 200,
  height = 200,
  className,
  primaryImageClassName,
  zoom = false,
  fill = false,
}: ImageZoomProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function handleOpen() {
    if (!zoom) return;
    setLoadingImage(true);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      {/* imagem base */}
      <div
        onClick={handleOpen}
        className={`${zoom ? "cursor-zoom-in" : "cursor-default"} ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={`${primaryImageClassName || "object-cover"}`}
        />
      </div>

      {/* modal */}
      {mounted &&
        zoom &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 bg-black/80 flex items-center justify-center p-6"
            onClick={handleClose}
          >
            {/* moldura */}
            <div
              className="
                relative inline-block
                bg-white rounded-xl shadow-2xl p-2
                max-w-[90vw] max-h-[90vh]
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* botão fechar */}
              <button
                onClick={handleClose}
                className="
                  absolute -top-3 -right-3
                  bg-white rounded-full shadow-lg
                  p-2 hover:bg-gray-100 transition
                "
                aria-label="Fechar imagem"
              >
                <X size={20} className="text-accent" />
              </button>

              {/* loader */}
              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                </div>
              )}

              {/* imagem grande */}
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1600}
                onLoadingComplete={() => setLoadingImage(false)}
                className={`
                  max-w-[80vw] max-h-[80vh]
                  w-auto h-auto rounded-xl
                  transition-opacity duration-300
                  ${loadingImage ? "opacity-0" : "opacity-100"}
                `}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
