import { api } from "./api";

export type MaintenanceAttachment = {
  id: string;

  maintenanceOrderId: string;

  name: string;
  fileUrl: string;

  mimeType: string;
  size?: number | null;

  createdByUserId?: string | null;

  createdAt: string;
};

export type CreateAttachmentPayload = {
  name: string;
  fileBase64: string;
};

export async function uploadAttachment(
  maintenanceId: string,
  payload: CreateAttachmentPayload
): Promise<MaintenanceAttachment> {
  const { data } = await api.post(
    `/maintenance/${maintenanceId}/attachments`,
    payload
  );

  return data;
}

export async function getAttachments(
  maintenanceId: string
): Promise<MaintenanceAttachment[]> {
  const { data } = await api.get(
    `/maintenance/${maintenanceId}/attachments`
  );

  return data;
}

export async function deleteAttachment(id: string): Promise<void> {
  await api.delete(`/maintenance/attachments/${id}`);
}