import { ToastHandler } from '../helpers/toast-handler';
import Student from '../interfaces/student';
import { ERROR_MESSAGES } from '../constants/request-error-message';

/**
 * Interfaces for environment config
 */

interface Environment {
  localApiUrl: string;
  remoteApiUrl: string;
}

const environment: Environment = {
  localApiUrl: 'http://localhost:3000',
  remoteApiUrl: 'https://crud-api-vuea.onrender.com',
};

export abstract class BaseService {
  abstract getAll(): Promise<Student[]>;
  abstract getById(id: string): Promise<Student | undefined>;
  abstract create(student: Student): Promise<Student>;
  abstract update(student: Student): Promise<Student>;
  abstract delete(id: string): Promise<void>;

  // Common error handling or utility methods could be added here
  protected handleError(error: unknown, operation: string): Error {
    console.error(`Error during ${operation}:`, error);

    const showErrorToast = (message: string) => {
      ToastHandler.show('error', 'Operation failed', message);
    };
    if (error instanceof Response) {
      switch (error.status) {
        case 400:
          showErrorToast(ERROR_MESSAGES.BAD_REQUEST);
          break;
        case 401:
          showErrorToast(ERROR_MESSAGES.UNAUTHORIZED);
          break;
        case 403:
          showErrorToast(ERROR_MESSAGES.FORBIDDEN);
          break;
        case 404:
          showErrorToast(ERROR_MESSAGES.NOT_FOUND);
          break;
        case 500:
          showErrorToast(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
          break;
        default:
          showErrorToast('An error occurred. Please try again later.');
          break;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('NetworkError')) {
        showErrorToast(ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        showErrorToast(ERROR_MESSAGES.UNEXPECTED_ERROR);
      }
    } else {
      showErrorToast(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }

    return error instanceof Error
      ? error
      : new Error(`Unknown error during ${operation}: ${String(error)}`);
  }
}

/**
 * ApiDataService class implement BaseService to manage student using a remote API
 */
class ApiDataService extends BaseService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    super();
    this.baseUrl = `${baseUrl}/students`;
  }

  /**
   * Handles the response from API
   * @param response - the response from the API
   * @returns  a promise that resolves to the parse response date
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw response;
    }

    return await response.json();
  }

  /**
   * Retrieves all students from api
   * @returns a promise that resolves to an array of student
   */
  async getAll(): Promise<Student[]> {
    try {
      const response = await fetch(this.baseUrl);
      return this.handleResponse<Student[]>(response);
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.FETCH_STUDENTS_ERROR);
    }
  }

  /**
   * Retrieves a student by id from API\
   * @param id = the id of student  to retrieve
   * @returns a promise that resolves to the student, or undefined if notfound
   */
  async getById(id: string): Promise<Student | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.status === 404) {
        return undefined;
      }
      return this.handleResponse<Student>(response);
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Creates a new student and save it the API
   * @param student - the student to create
   * @returns a promise that resolves to the created student
   *
   */
  async create(student: Student): Promise<Student> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      return this.handleResponse<Student>(response);
    } catch (error) {
      console.error('Error creating student:', error);
      throw this.handleError(error, ERROR_MESSAGES.CREATE_STUDENT_ERROR);
    }
  }

  /**
   * update an existing student from API
   * @param student - the student to update
   * @returns a promise that resolves to the updated student
   */
  async update(student: Student): Promise<Student> {
    try {
      const response = await fetch(`${this.baseUrl}/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      return this.handleResponse<Student>(response);
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.UPDATE_STUDENT_ERROR);
    }
  }

  /**
   * Deletes a student by id from api
   * @param id -  the id of student to delete
   * @returns a promise that resolves when a student is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.DELETE_STUDENT_ERROR);
    }
  }
}

/**
 * DataServiceEnvironment class provides a method to create an appropriate data service instance
 * based on the availability of local or remote api
 */
export class DataServiceEnvironment {
  /**
   * Create an instance of BaseService based on the availability of of local or remote api
   * @returns a promise that resolves to an instance of BaseService
   *
   */
  static async create(): Promise<BaseService> {
    // Test if we are at local json server
    try {
      const response = await fetch(`${environment.localApiUrl}/students`);
      if (response.ok) {
        console.log('Using local json server');

        return new ApiDataService(environment.localApiUrl);
      }
    } catch (error) {
      console.log('Local json server not available');
    }

    // Try remote Json server
    try {
      const response = await fetch(`${environment.remoteApiUrl}/students`);
      if (response.ok) {
        console.log('Using remote Json server');

        return new ApiDataService(environment.remoteApiUrl);
      }
    } catch (error) {
      console.log('Remote json server is not available');
    }

    // Only use this as fallback for API URL, not for image base URL
    return new ApiDataService(environment.remoteApiUrl);
  }
}

/**
 * Get the singleton instance of BaseService
 * @returns a Promise that resolves to the singleton instance of BaseService
 */
let dataServiceInstance: BaseService | null = null;
export const getDataService = async (): Promise<BaseService> => {
  if (!dataServiceInstance) {
    dataServiceInstance = await DataServiceEnvironment.create();
  }
  return dataServiceInstance;
};

/**
 * Init the data service and attach it to the window object for global access
 */
DataServiceEnvironment.create().then((service) => {
  (window as any).dataService = service;
});
export const dataService = (window as any).dataService;
