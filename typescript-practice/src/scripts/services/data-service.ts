<<<<<<< HEAD
import { ToastHandler } from '../helpers/toast-handler';
=======
import { StudentNotFoundError } from '../helpers/error';
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
=======
  baseImageUrl: 'https://typescript-training-jz30.onrender.com',
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD

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
=======
    return error instanceof Error
      ? error
      : new Error(`Unknown error during ${operation}: ${String(error)}`);
  }
}

/**
 * LocalStorageService class implements BaseService to manage student data using localStorage
 */
class LocalStorageService extends BaseService {
  private readonly STORAGE_KEY = 'all students';
  private baseImageUrl: string;

  constructor(baseImageUrl: string) {
    super();
    this.baseImageUrl = baseImageUrl;
  }

  /**
   * Retrieves all students from localStorage
   * @returns a promise that resolves to an array of students
   *
   */
  async getAll(): Promise<Student[]> {
    try {
      const studentJson = localStorage.getItem(this.STORAGE_KEY);
      const students = studentJson ? JSON.parse(studentJson) : [];

      return students;
    } catch (error) {
      throw this.handleError(error, 'retrieving students from local storage');
    }
  }

  /**
   * Retrieves a student by id from localStorage
   * @param id - the id of student to retrieve
   * @returns a promise that resolves to the student, or undefined if not found
   */
  async getById(id: string): Promise<Student | undefined> {
    const students = await this.getAll();
    const student = students.find((s) => s.id === id);
    if (!student) {
      throw this.handleError(new StudentNotFoundError(id), 'retrieving student by id');
    }

    return student;
  }

  /**
   * Creates a new student and save it to localStorage
   * @param student - the student to create
   * @returns a promise that resolved to created student
   */
  async create(student: Student): Promise<Student> {
    const students = await this.getAll();
    students.push(student);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));

    return student;
  }

  /**
   * Update the existing student in localStorage
   * @param student - the student to update
   * @returns a premise that resolved to the updated student
   */
  async update(student: Student): Promise<Student> {
    const students = await this.getAll();
    const index = students.findIndex((s) => s.id === student.id);
    if (index === -1) {
      throw this.handleError(new StudentNotFoundError(student.id!), 'updating student');
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));

    return student;
  }

  /**
   * Deletes student by id from localStorage
   * @param id = the id of student to delete
   * @returns - a promise that resolved when the student is deleted
   */
  async delete(id: string): Promise<void> {
    const students = await this.getAll();
    const filteredStudents = students.filter((s) => s.id !== id);
    if (filteredStudents.length === students.length) {
      throw new StudentNotFoundError(id);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredStudents));
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
=======
    this.baseImageUrl = environment.baseImageUrl;
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
  }

  /**
   * Handles the response from API
   * @param response - the response from the API
   * @returns  a promise that resolves to the parse response date
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
<<<<<<< HEAD
      throw response;
=======
      throw this.handleError(new Error(`Error! Status: ${response.status}`), 'fetching data');
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
      throw this.handleError(error, ERROR_MESSAGES.FETCH_STUDENTS_ERROR);
=======
      throw this.handleError(error, 'fetching all students');
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
      throw this.handleError(error, ERROR_MESSAGES.CREATE_STUDENT_ERROR);
=======
      throw this.handleError(error, 'creating student');
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
      throw this.handleError(error, ERROR_MESSAGES.UPDATE_STUDENT_ERROR);
=======
      throw this.handleError(error, 'updating student');
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
<<<<<<< HEAD
      throw this.handleError(error, ERROR_MESSAGES.DELETE_STUDENT_ERROR);
=======
      throw this.handleError(error, 'deleting student');
>>>>>>> 6e246a3bff7ab432f568d5f4b141972aa1a61841
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
