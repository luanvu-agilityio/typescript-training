import { BaseService } from './base-service';
import IStudent from '../interfaces/student';
import { ERROR_MESSAGES } from '../constants/request-error-message';

/**
 * Interfaces for environment config
 */

interface IEnvironment {
  localApiUrl: string;
  remoteApiUrl: string;
}

const environment: IEnvironment = {
  localApiUrl: 'http://localhost:3000',
  remoteApiUrl: 'https://crud-api-vuea.onrender.com',
};

/**
 * ApiDataService class implement BaseService to manage student using a remote API
 */
class ApiDataService extends BaseService<IStudent> {
  /**
   * Constructor to initialize the base URL for the student endpoint
   * @param baseUrl - The base URL for the student endpoint
   */

  constructor(baseUrl: string) {
    super(`${baseUrl}/students`);
  }

  /**
   * Handles the response from API
   * @param response - the response from the API
   * @returns  a promise that resolves to the parse response date
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw response;
      throw response;
    }

    return await response.json();
  }

  /**
   * Retrieves all students from api
   * @returns a promise that resolves to an array of student
   */
  async getAll(): Promise<IStudent[]> {
    try {
      const response = await fetch(this.baseUrl);
      return this.handleResponse<IStudent[]>(response);
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.FETCH_STUDENTS_ERROR);
      throw this.handleError(error, ERROR_MESSAGES.FETCH_STUDENTS_ERROR);
    }
  }

  /**
   * Retrieves a student by id from API\
   * @param id = the id of student  to retrieve
   * @returns a promise that resolves to the student, or undefined if notfound
   */
  async getById(id: string): Promise<IStudent | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.status === 404) {
        return undefined;
      }
      return this.handleResponse<IStudent>(response);
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
  async create(student: IStudent): Promise<IStudent> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      return this.handleResponse<IStudent>(response);
    } catch (error) {
      console.error('Error creating student:', error);
      throw this.handleError(error, ERROR_MESSAGES.CREATE_STUDENT_ERROR);
      throw this.handleError(error, ERROR_MESSAGES.CREATE_STUDENT_ERROR);
    }
  }

  /**
   * update an existing student from API
   * @param student - the student to update
   * @returns a promise that resolves to the updated student
   */
  async update(student: IStudent): Promise<IStudent> {
    try {
      const response = await fetch(`${this.baseUrl}/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      return this.handleResponse<IStudent>(response);
    } catch (error) {
      throw this.handleError(error, ERROR_MESSAGES.UPDATE_STUDENT_ERROR);
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
  static async create(): Promise<BaseService<IStudent>> {
    // Test if we are at local json server
    try {
      const response = await fetch(`${environment.localApiUrl}/students`);
      if (response.ok) {
        return new ApiDataService(environment.localApiUrl);
      }
    } catch (error) {
      console.log('Local json server not available');
    }

    // Try remote Json server
    try {
      const response = await fetch(`${environment.remoteApiUrl}/students`);
      if (response.ok) {
        return new ApiDataService(environment.remoteApiUrl);
      }
    } catch (error) {
      console.log('Remote json server is not available');
    }

    // fallback for API URL
    return new ApiDataService(environment.remoteApiUrl);
  }
}

/**
 * Get the singleton instance of BaseService
 * @returns a Promise that resolves to the singleton instance of BaseService
 */
let dataServiceInstance: BaseService<IStudent> | null = null;
export const getDataService = async (): Promise<BaseService<IStudent>> => {
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
