"use client";
import {
  uploadAttachment,
  deleteAttachment,
  MaintenanceAttachment,
  getAttachments,
} from "@/services/maintenanceAttachments.service";
import {
  Upload,
  Trash2,
  FileText,
  Loader2,
  Eye,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

type Props = {
  maintenanceId: string;
  onUpdate: () => void;
};

export function MaintenanceAttachments({
  maintenanceId,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([]);

  function fetchAttachments() {
    const fetchData = async () => {
      try {
        const data = await getAttachments(maintenanceId);
        setAttachments(data);
      } catch {
        toast.error("Erro ao carregar anexos");
      }
    };

    fetchData();
  }

  function isImage(mime: string) {
    return mime.startsWith("image/");
  }

  function validateFile(file: File) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowed.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido");
      return false;
    }

    const maxSize =
      file.type === "application/pdf" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Arquivo muito grande");
      return false;
    }

    return true;
  }

  async function handleFiles(files: FileList) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateFile(file)) continue;

      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          setLoading(true);

          await uploadAttachment(maintenanceId, {
            name: file.name,
            fileBase64: reader.result as string,
          });

          toast.success(`"${file.name}" enviado`);
          onUpdate();
        } catch {
          toast.error(`Erro ao enviar "${file.name}"`);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAttachment(id);
      toast.success("Arquivo removido");
      onUpdate();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  // Visualizar (imagem/pdf)
  function handleView(file: MaintenanceAttachment) {
    window.open(file.fileUrl, "_blank");
  }

  useEffect(() => {
    fetchAttachments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceId]);

  return (
    <div className="rounded-2xl border border-border bg-alternative-bg p-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">
          Anexos ({attachments.length})
        </p>

        <label className="cursor-pointer flex items-center gap-2 text-accent text-sm">
          <Upload size={16} />
          Upload
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* LISTA */}
      {attachments.length === 0 ? (
        <div className="text-xs text-muted text-center py-6">
          Nenhum anexo ainda
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="relative border border-border rounded-xl overflow-hidden bg-background group"
            >
              {/* PREVIEW */}
              <div
                className="cursor-pointer"
                onClick={() => handleView(file)}
              >
                {isImage(file.mimeType) ? (
                  <Image
                    width={200}
                    height={200}
                    src={file.fileUrl}
                    alt={file.name}
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center gap-1">
                    <FileText className="text-muted" size={22} />
                    <span className="text-[10px] text-muted">PDF</span>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-2 text-xs truncate">{file.name}</div>

              {/* ACTIONS */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  onClick={() => handleView(file)}
                  className="bg-white text-black p-2 rounded cursor-pointer"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => handleDelete(file.id)}
                  className="bg-red-500 text-white p-2 rounded cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <Loader2 size={14} className="animate-spin" />
          Enviando arquivos...
        </div>
      )}
    </div>
  );
}