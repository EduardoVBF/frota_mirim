import { FIELD_LABELS } from "./formFieldLabels";

type ApiErrorResponse = {
  message: string;
  errors?: {
    body?: Record<string, string[]>;
  };
};

function humanizeMessage(message: string) {
  const normalized = message.toLowerCase();

  // 👉 Caso especial: recebido null
  if (normalized.includes("recebido null")) {
    const expectedMatch = message.match(/Esperado\s(.+?),/i);
    const expectedType = expectedMatch?.[1];

    const expectedHuman = expectedType
      ?.replace("string", "texto")
      ?.replace("number", "número")
      ?.replace("boolean", "booleano")
      ?.replace("array", "lista")
      ?.replace("object", "objeto");

    return expectedHuman
      ? `Campo é obrigatório. Esperado ${expectedHuman}.`
      : "Campo é obrigatório.";
  }

  // 👉 Tratamento padrão
  return message
    .replace("Tipo inválido.", "")
    .replace("Esperado", "Esperado")
    .replace("recebido", "recebido")
    .replace("string", "texto")
    .replace("number", "número")
    .replace("null", "nulo")
    .trim();
}

export function translateApiErrors(error: ApiErrorResponse) {
  const fieldErrors: Record<string, string> = {};
  const toastMessages: string[] = [];

  if (!error?.errors?.body) {
    return { fieldErrors, toastMessage: error.message };
  }

  Object.entries(error.errors.body).forEach(([field, messages]) => {
    const label = FIELD_LABELS[field] ?? field;

    const humanMessage = humanizeMessage(messages[0]);

    fieldErrors[field] = humanMessage;
    toastMessages.push(`${label}: ${humanMessage}`);
  });

  return {
    fieldErrors,
    toastMessage: (
      <ul className="list-disc list-inside">
        {toastMessages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    ),
  };
}
