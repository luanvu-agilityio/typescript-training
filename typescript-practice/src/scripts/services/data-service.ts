import { StudentNotFoundError } from '../controllers/controller';
import Student from '../interfaces/student';

/**
 * Interfaces for environment config
 */

interface Environment {
  localApiUrl: string;
  remoteApiUrl: string;
  baseImageUrl: string;
}

const environment: Environment = {
  localApiUrl: 'http://localhost:3000',
  remoteApiUrl: 'https://crud-api-vuea.onrender.com',
  baseImageUrl: 'http://localhost:3000',
};

/**
 * Normalizes the avatar url to ensure it is a full url
 * @param avatar - the avatar url to normalize
 * @param baseUrl - the base url to use if avatar url is relative
 * @returns the normalized avatar url
 */
const normalizeAvatarUrl = (avatar: string, baseUrl: string): string => {
  if (!avatar) return '';

  if (avatar.startsWith('http')) return avatar;

  const fileName = avatar.includes('/') ? avatar.split('/').pop() : avatar;

  return `${baseUrl}/${fileName}`;
};

export interface BaseService {
  getAll(): Promise<Student[]>;
  getById(id: string): Promise<Student | undefined>;
  create(student: Student): Promise<Student>;
  update(student: Student): Promise<Student>;
  delete(id: string): Promise<void>;
}

/**
 * LocalStorageService class implements BaseService to manage student data using localStorage
 */
class LocalStorageService implements BaseService {
  private readonly STORAGE_KEY = 'all students';
  private baseImageUrl: string;

  constructor(baseImageUrl: string) {
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

      // Normalize avatar URLs
      return students.map((student: Student) => ({
        ...student,
        avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
      }));
    } catch (error) {
      throw new Error('fail to retrieve students form local storage');
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
      throw new Error(`Student with ID ${id} is not found`);
    }
    return {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
    };
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
    return {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
    };
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
      throw new StudentNotFoundError(`Student with Id ${student.id} is not found`);
    }
    // Normalize avatar before storing
    const normalizedStudent = {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
    };

    students[index] = normalizedStudent;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return normalizedStudent;
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
  }
}

/**
 * ApiDataService class implement BaseService to manage student using a remote API
 */
class ApiDataService implements BaseService {
  private readonly baseUrl: string;
  private readonly baseImageUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/students`;
    this.baseImageUrl = baseUrl;
  }

  /**
   * Handles the response from API
   * @param response - the response from the API
   * @returns  a promise that resolves to the parse response date
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    const data = await response.json();

    // If it's a student or array of students, normalize the avatar URLs
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        avatar: normalizeAvatarUrl(item.avatar, this.baseImageUrl),
      })) as T;
    } else if (data && typeof data === 'object' && 'avatar' in data) {
      return {
        ...data,
        avatar: normalizeAvatarUrl(data.avatar, this.baseImageUrl),
      } as T;
    }

    return data;
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
      console.error('Error fetching student:', error);
      throw new Error('Fail to fetch students for API');
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
      const normalizedStudent = {
        ...student,
        avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
      };
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedStudent),
      });
      return this.handleResponse<Student>(response);
    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error('Fail to create student in API');
    }
  }

  /**
   * update an existing student from API
   * @param student - the student to update
   * @returns a promise that resolves to the updated student
   */
  async update(student: Student): Promise<Student> {
    try {
      const normalizedStudent = {
        ...student,
        avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
      };
      const response = await fetch(`${this.baseUrl}/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedStudent),
      });
      return this.handleResponse<Student>(response);
    } catch (error) {
      console.error(`Error updating studnet ${student.id}:`, error);
      throw new Error(`Fail to update student ${student.id} in API`);
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
      console.error(`Error deleting student ${id}`, error);
      throw new Error(`Fail to delete student ${id} from Api`);
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
    // Suppress console errors temporarily
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    // Only log the final decision or error
    let finalMessage = '';
    console.log = (message) => {
      finalMessage = message;
    };
    console.error = () => {};

    try {
      // Test if we are at local json server
      try {
        const response = await fetch(`${environment.localApiUrl}/students`);
        if (response.ok) {
          finalMessage = 'Using local json server';
          environment.baseImageUrl = environment.localApiUrl;
          return new ApiDataService(environment.localApiUrl);
        }
      } catch (error) {
        // Silently fail
      }

      // Try remote Json server
      try {
        const response = await fetch(`${environment.remoteApiUrl}/students`);
        if (response.ok) {
          finalMessage = 'Using remote Json server';
          environment.baseImageUrl = environment.remoteApiUrl;
          return new ApiDataService(environment.remoteApiUrl);
        }
      } catch (error) {
        // Silently fail
      }

      // No service available
      finalMessage = 'Warning: No API servers available, falling back to local implementation';
      environment.baseImageUrl = 'http://localhost:1234';
      return new LocalStorageService(environment.baseImageUrl);
    } finally {
      // Restore original console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      // Log the final result
      console.log(finalMessage);
    }
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
