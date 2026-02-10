import { AppError } from "./app-error";

export type ValidationErrors = Record<
  string, // body | params | query
  Record<string, string[]>
>;

export class ValidationError extends AppError {
  public readonly errors: ValidationErrors;

  constructor(errors: ValidationErrors) {
    super("Erro de validação", 400);
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
