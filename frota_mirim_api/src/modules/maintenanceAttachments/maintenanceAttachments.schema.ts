import { z } from "zod";

export const attachmentParamsSchema = z.object({
  id: z.uuid(),
});

export const createAttachmentParamsSchema = z.object({
  maintenanceId: z.uuid(),
});

export const attachmentsByMaintenanceParamsSchema = z.object({
  maintenanceId: z.uuid(),
});

export const createAttachmentBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),

  fileBase64: z
    .string()
    .min(10, "Arquivo inválido")
    .refine((val) => val.startsWith("data:"), {
      message: "Arquivo deve estar em base64 válido",
    }),
});

export const attachmentResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  fileUrl: z.string().url(),
  mimeType: z.string(),
  size: z.number().nullable().optional(),
  createdAt: z.date(),
});

export const attachmentsListResponseSchema = z.array(attachmentResponseSchema);

export type CreateAttachmentDTO = z.infer<typeof createAttachmentBodySchema>;
export type AttachmentResponseDTO = z.infer<typeof attachmentResponseSchema>;
export type AttachmentsListResponseDTO = z.infer<
  typeof attachmentsListResponseSchema
>;
