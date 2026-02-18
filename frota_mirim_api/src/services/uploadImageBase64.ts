import { bucket } from "../lib/firabase";
import { randomUUID } from "crypto";

export async function uploadBase64ToFirebase(
  base64: string,
  folder: string
): Promise<string> {
  const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Imagem base64 inválida");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Converter para buffer
  const buffer = Buffer.from(base64Data, "base64");

  // Nome do arquivo
  const fileName = `${folder}/${randomUUID()}`;

  const file = bucket.file(fileName);

  // Upload
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
  });

  // Tornar público
  await file.makePublic();

  // Retornar URL
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}
