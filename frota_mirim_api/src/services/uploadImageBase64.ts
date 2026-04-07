import { bucket } from "../lib/firabase";
import { randomUUID } from "crypto";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function getExtensionFromMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return map[mime] || "bin";
}

export async function uploadBase64ToFirebase(
  base64: string,
  folder: string
): Promise<string> {
  // Aceita QUALQUER mime (não só imagem)
  const matches = base64.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Arquivo base64 inválido");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Valida tipo permitido
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  // Converter base64 → buffer
  const buffer = Buffer.from(base64Data, "base64");

  // Gerar nome com extensão correta
  const extension = getExtensionFromMime(mimeType);
  const fileName = `${folder}/${randomUUID()}.${extension}`;

  const file = bucket.file(fileName);

  // Upload
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
  });

  // Tornar público
  await file.makePublic();

  // URL pública
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}