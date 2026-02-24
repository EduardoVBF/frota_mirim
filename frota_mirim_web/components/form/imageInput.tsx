"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ImageInputProps {
  value?: string | null; // imageUrl (edição)
  onChange: (base64: string | null) => void;
  placeholderImage?: string;
  error?: string;
}

export default function ImageInput({
  value,
  onChange,
  error,
  placeholderImage = "/image/placeholder-image.png",
}: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  function handleFileChange(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-2">
      {/* preview clicável */}
      <div
        onClick={openFilePicker}
        className={`
          ${error ? "border-red-500" : "border-gray-300 hover:border-accent"}
          w-48 h-48
          border-2 rounded-lg
          overflow-hidden
          flex items-center justify-center
          bg-gray-50
          cursor-pointer
          hover:opacity-90
          transition
        `}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Imagem selecionada"
            width={192}
            height={192}
          />
        ) : (
          <Image
            src={placeholderImage}
            alt="Placeholder"
            width={192}
            height={192}
            className="opacity-50"
          />
        )}
      </div>

      {/* input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
        className="hidden"
      />
      {error && (
        <div className="flex items-center justify-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
