import { ToastHandler } from '../helpers/toast-handler';
import { ERROR_MESSAGES } from '../constants/request-error-message';

/**
 * Generic type param T represents the resource type (e.g., IStudent, IUser, ICategory if we have in the future)
 * Generic type param ID represents the type of the identifier (usually string or number)
 */
export abstract class BaseService<T, ID = string> {
  /**
   * Base URL for the specific resource endpoint
   */
  protected readonly baseUrl: string;

  /**
   * Constructor to initialize the base URL for a specific resource
   * @param baseUrl - The base URL for the resource endpoint
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves all resources from the API
   * @returns a promise that resolves to an array of resources
   */
  abstract getAll(): Promise<T[]>;

  /**
   * Retrieves a single resource by its identifier
   * @param id - The unique identifier of the resource
   * @returns a promise that resolves to the resource or undefined if not found
   */
  abstract getById(id: ID): Promise<T | undefined>;

  /**
   * Creates a new resource
   * @param resource - The resource to create
   * @returns a promise that resolves to the created resource
   */
  abstract create(resource: T): Promise<T>;

  /**
   * Updates an existing resource
   * @param resource - The updated resource
   * @returns a promise that resolves to the updated resource
   */
  abstract update(resource: T): Promise<T>;

  /**
   * Deletes a resource by its identifier
   * @param id - The unique identifier of the resource
   * @returns a promise that resolves when the resource is deleted
   */
  abstract delete(id: ID): Promise<void>;

  /**
   * Handles API response
   * @param response - The fetch API response
   * @returns A promise that resolves to the parsed response data
   */
  protected async handleResponse<R>(response: Response): Promise<R> {
    if (!response.ok) {
      throw response;
    }
    return await response.json();
  }

  /**
   * Common error handling method with flexible error toast
   * @param error - The error object
   * @param operation - Description of the operation that failed
   * @param customErrorMessages - Optional custom error messages for specific status codes
   * @returns An Error instance
   */
  protected handleError(
    error: unknown,
    operation: string,
    customErrorMessages?: Partial<Record<number, string>>,
  ): Error {
    console.error(`Error during ${operation}:`, error);

    const defaultErrorMessages: Record<number, string> = {
      400: ERROR_MESSAGES.BAD_REQUEST,
      401: ERROR_MESSAGES.UNAUTHORIZED,
      403: ERROR_MESSAGES.FORBIDDEN,
      404: ERROR_MESSAGES.NOT_FOUND,
      500: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    };

    const errorMessages = { ...defaultErrorMessages, ...customErrorMessages };

    const showErrorToast = (message: string) => {
      ToastHandler.show('error', 'Operation failed', message);
    };

    if (error instanceof Response) {
      const errorMessage = errorMessages[error.status] || ERROR_MESSAGES.DEFAULT_ERROR;
      showErrorToast(errorMessage);
    } else if (error instanceof Error) {
      const errorMessage = error.message.includes('NetworkError')
        ? ERROR_MESSAGES.NETWORK_ERROR
        : ERROR_MESSAGES.UNEXPECTED_ERROR;
      showErrorToast(errorMessage);
    } else {
      showErrorToast(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
    return error instanceof Error ? error : new Error('An error occurred');
  }
}
