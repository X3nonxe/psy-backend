export type ValidationErrorDetail = {
  field: string;
  message: string;
};

export class ValidationError extends Error {
  public details: ValidationErrorDetail[];
  public statusCode: number;

  constructor(message: string, details: ValidationErrorDetail[]) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 422;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}