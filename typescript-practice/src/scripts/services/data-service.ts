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

class LocalStorageService implements BaseService {
  private readonly STORAGE_KEY = 'all students';
  private baseImageUrl: string;

  constructor(baseImageUrl: string) {
    this.baseImageUrl = baseImageUrl;
  }
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
    return {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
    };
  }

  async create(student: Student): Promise<Student> {
    const students = await this.getAll();
    students.push(student);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar, this.baseImageUrl),
    };
  }

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
  private readonly baseImageUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/students`;
    this.baseImageUrl = baseUrl;
  }

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
  static async create(): Promise<BaseService> {
    // Test if we are at local json server
    try {
      const response = await fetch(`${environment.localApiUrl}/students`);
      if (response.ok) {
        console.log('Using local json server');
        environment.baseImageUrl = environment.localApiUrl;
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
        environment.baseImageUrl = environment.remoteApiUrl;
        return new ApiDataService(environment.remoteApiUrl);
      }
    } catch (error) {
      console.log('Remote json server is not available');
    }
    environment.baseImageUrl = 'http://localhost:1234';
    return new ApiDataService(environment.baseImageUrl);
  }
}

let dataServiceInstance: BaseService | null = null;
export const getDataService = async (): Promise<BaseService> => {
  if (!dataServiceInstance) {
    dataServiceInstance = await DataServiceEnvironment.create();
  }
  return dataServiceInstance;
};

DataServiceEnvironment.create().then((service) => {
  (window as any).dataService = service;
});
export const dataService = (window as any).dataService;
