import { LoadingSpinner } from '../helpers/loading-spinner';
import { ToastHandler } from '../helpers/toast-handler';
import { StorageError, StudentNotFoundError, ValidationError } from '../helpers/error-type';
import { BaseService } from '../services/base-service';
import IStudent from '../interfaces/student';

/**
 * AbstractController provides a base for all controller classes with common functionality
 * for error handling, loading state management, and core operations.
 */
export abstract class AbstractController<ModelType, ServiceType extends BaseService<IStudent>> {
  protected loadingSpinner: LoadingSpinner;
  protected readonly dataService: ServiceType;

  /**
   * Creates a new controller instance
   * @param dataService - The data service to use for data operations
   */
  constructor(dataService: ServiceType) {
    this.loadingSpinner = LoadingSpinner.getInstance();
    this.dataService = dataService;
  }

  /**
   * Initializes the controller and loads initial data
   * This method should be called after the controller is constructed
   */
  public abstract initialize(): Promise<void>;

  /**
   * Handles errors by displaying appropriate messages and logging the error.
   * @param error - The error object.
   * @param rethrow - Whether to rethrow the error after handling
   */
  protected handleError(error: unknown, rethrow: boolean = false): void {
    const errorMessage = this.getErrorMessage(error);
    console.error('Error:', error);

    if (error instanceof ValidationError) {
      // Validation errors are typically handled by the form
      if (rethrow) throw error;
    } else if (error instanceof StudentNotFoundError) {
      ToastHandler.show('error', 'Student Not Found', errorMessage);
    } else if (error instanceof StorageError) {
      ToastHandler.show('error', 'Storage Error', errorMessage);
    } else {
      ToastHandler.show('error', 'System Error', `An unexpected error occurred: ${errorMessage}`);
    }

    if (rethrow) throw error;
  }

  /**
   * Retrieves the error message from an error object.
   * @param error - The error object.
   * @returns The error message.
   */
  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Executes an operation with loading spinner and error handling
   * @param operation - The async operation to execute
   * @param errorMessage - The error message to use if the operation fails
   * @param showLoadingSpinner - Whether to show the loading spinner
   * @returns A promise that resolves to the result of the operation
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed',
    showLoadingSpinner: boolean = true,
  ): Promise<T> {
    try {
      if (showLoadingSpinner) this.loadingSpinner.show();
      return await operation();
    } catch (error) {
      throw new StorageError(`${errorMessage}: ${this.getErrorMessage(error)}`);
    } finally {
      if (showLoadingSpinner) this.loadingSpinner.hide();
    }
  }

  /**
   * Retrieves all items from the data service
   * @returns A promise that resolves to an array of items
   */
  protected async getAll(): Promise<ModelType[]> {
    return this.executeOperation(
      async () => (await this.dataService.getAll()) as unknown as ModelType[],
      'Failed to retrieve items',
      false,
    );
  }

  /**
   * Retrieves an item by ID from the data service
   * @param id - The ID of the item to retrieve
   * @returns A promise that resolves to the item
   */
  protected async getById(id: string): Promise<ModelType> {
    return this.executeOperation(async () => {
      const item = (await this.dataService.getById(id)) as unknown as ModelType;
      if (!item) {
        throw new StudentNotFoundError(id);
      }
      return item;
    }, `Failed to retrieve item with ID ${id}`);
  }

  /**
   * Creates a new item in the data service
   * @param item - The item to create
   * @returns A promise that resolves to the created item
   */
  protected async create(item: ModelType): Promise<ModelType> {
    return this.executeOperation(
      async () => (await this.dataService.create(item as any)) as unknown as ModelType,
      'Failed to create item',
    );
  }

  /**
   * Updates an existing item in the data service
   * @param item - The item to update
   * @returns A promise that resolves to the updated item
   */
  protected async update(item: ModelType): Promise<ModelType> {
    return this.executeOperation(
      async () => (await this.dataService.update(item as any)) as unknown as ModelType,
      'Failed to update item',
    );
  }

  /**
   * Deletes an item by ID from the data service
   * @param id - The ID of the item to delete
   * @returns A promise that resolves when the item is deleted
   */
  protected async delete(id: string): Promise<void> {
    return this.executeOperation(
      async () => await this.dataService.delete(id),
      `Failed to delete item with ID ${id}`,
    );
  }
}
