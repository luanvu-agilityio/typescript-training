import { StudentNotFoundError } from '../controllers/controller';
import Student from '../interfaces/student';

/**
 * Interfaces for environment config
 */

interface Environment {
  apiUrl: string;
  useLocal: boolean;
}

const environment: Environment = {
  apiUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://your-render-app-name.onrender.com'
      : 'http://localhost:3000',
  useLocal: process.env.USE_LOCAL_STORAGE === 'true',
};

export interface BaseService {
  getAll(): Promise<Student[]>;
  getById(id: string): Promise<Student | undefined>;
  create(student: Student): Promise<Student>;
  update(student: Student): Promise<Student>;
  delete(id: string): Promise<void>;
}

class LocalStorageService implements BaseService {
  private readonly STORAGE_KEY = 'all students';

  async getAll(): Promise<Student[]> {
    try {
      const studentJson = localStorage.getItem(this.STORAGE_KEY);
      return studentJson ? JSON.parse(studentJson) : [];
    } catch (error) {
      console.error('Error retrieving student from localStorage:', error);
      throw new Error('fail to retrieve students form local storage');
    }
  }

  async getById(id: string): Promise<Student | undefined> {
    const students = await this.getAll();
    const student = students.find((s) => s.id === id);
    if (!student) {
      throw new Error(`Student with ID ${id} is not found`);
    }
    return student;
  }

  async create(student: Student): Promise<Student> {
    const students = await this.getAll();
    students.push(student);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return student;
  }

  async update(student: Student): Promise<Student> {
    const students = await this.getAll();
    const index = students.findIndex((s) => s.id === student.id);
    if (index === -1) {
      throw new StudentNotFoundError(`Student with Id ${student.id} is not found`);
    }
    students[index] = student;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return student;
  }

  async delete(id: string): Promise<void> {
    const students = await this.getAll();
    const filteredStudents = students.filter((s) => s.id !== id);
    if (filteredStudents.length === students.length) {
      throw new StudentNotFoundError(id);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredStudents));
  }
}

class ApiDataService implements BaseService {
  private readonly baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/students`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    return response.json();
  }

  async getAll(): Promise<Student[]> {
    try {
      const response = await fetch(this.baseUrl);
      return this.handleResponse<Student[]>(response);
    } catch (error) {
      console.error('Error fetching student:', error);
      throw new Error('Fail to fetch students for API');
    }
  }

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
      throw new Error('Fail to create student in API');
    }
  }

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
      console.error(`Error updating studnet ${student.id}:`, error);
      throw new Error(`Fail to update student ${student.id} in API`);
    }
  }

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

export class DataServiceEnvironment {
  static create(): BaseService {
    return environment.useLocal
      ? new LocalStorageService()
      : new ApiDataService(environment.apiUrl);
  }
}

export const dataService = DataServiceEnvironment.create();
