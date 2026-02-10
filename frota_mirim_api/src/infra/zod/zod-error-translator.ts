type ZodIssueLike = {
  code: string;
  message?: string;
  expected?: string;
  minimum?: number;
  maximum?: number;
  type?: "string" | "number" | "array";
  multipleOf?: number;
  validation?: string;
  options?: string[];
  keys?: string[];
  [key: string]: any;
};

function extractReceivedType(message?: string): string | null {
  if (!message) return null;

  const match = message.match(/received\s+(\w+)/i);
  return match?.[1] ?? null;
}

export function translateZodIssue(issue: ZodIssueLike): string {
  switch (issue.code) {
    case "invalid_type": {
      const received = extractReceivedType(issue.message);

      if (received === "undefined") {
        return "Campo obrigatório";
      }

      if (received && issue.expected) {
        return `Tipo inválido. Esperado ${issue.expected}, recebido ${received}`;
      }

      return "Tipo inválido";
    }

    case "invalid_literal":
      return issue.expected
        ? `Valor inválido. Esperado: ${issue.expected}`
        : "Valor inválido";

    case "unrecognized_keys":
      return issue.keys?.length
        ? `Campos não permitidos: ${issue.keys.join(", ")}`
        : "Campos não permitidos";

    case "invalid_union":
      return "Valor inválido";

    case "invalid_union_discriminator":
      return issue.options?.length
        ? `Discriminador inválido. Valores válidos: ${issue.options.join(", ")}`
        : "Discriminador inválido";

    case "invalid_enum_value":
      return issue.options?.length
        ? `Valor inválido. Opções válidas: ${issue.options.join(", ")}`
        : "Valor inválido";

    case "invalid_string":
      switch (issue.validation) {
        case "email":
          return "Formato de e-mail inválido";
        case "url":
          return "URL inválida";
        case "uuid":
          return "UUID inválido";
        case "regex":
          return "Formato inválido";
        case "cuid":
          return "CUID inválido";
        case "cuid2":
          return "CUID2 inválido";
        case "datetime":
          return "Data/hora inválida";
        case "ip":
          return "Endereço IP inválido";
        default:
          return "Texto inválido";
      }

    case "too_small":
      if (issue.origin === "string") {
        return `Deve ter no mínimo ${issue.minimum} caracteres`;
      }
      if (issue.origin === "number") {
        return `Deve ser no mínimo ${issue.minimum}`;
      }
      if (issue.origin === "array") {
        return `Deve ter no mínimo ${issue.minimum} itens`;
      }
      return "Valor menor que o permitido";

    case "too_big":
      if (issue.origin === "string") {
        return `Deve ter no máximo ${issue.maximum} caracteres`;
      }
      if (issue.origin === "number") {
        return `Deve ser no máximo ${issue.maximum}`;
      }
      if (issue.origin === "array") {
        return `Deve ter no máximo ${issue.maximum} itens`;
      }
      return "Valor maior que o permitido";

    case "not_multiple_of":
      return issue.multipleOf != null
        ? `Deve ser múltiplo de ${issue.multipleOf}`
        : "Valor inválido";

    case "invalid_date":
      return "Data inválida";

    case "custom":
      return issue.message ?? "Valor inválido";

    default:
      return issue.message ?? "Valor inválido";
  }
}
