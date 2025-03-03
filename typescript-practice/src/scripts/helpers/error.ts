/**
 * Custom error class to handle student related errors
 */

export class StudentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentError';
  }
}

/**
 * Custom class to handle the case where student is not found
 */
export class StudentNotFoundError extends StudentError {
  constructor(id: string) {
    super(`Student with ID ${id} not found`);
    this.name = 'StudentNotFoundError';
  }
}

/**
 * Custom class to handle validation errors
 */
export class ValidationError extends StudentError {
  public errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Custom class to handle storage related errors
 */
export class StorageError extends StudentError {
  constructor(message: string) {
    super(`Storage operation failed: ${message}`);
    this.name = 'StorageError';
  }
}
