import { StudentNotFoundError } from '../controllers/controller';
import Student from '../interfaces/student';

/**
 * Interfaces for environment config
 */

interface Environment {
  apiUrl: string;
  useLocal: boolean;
  baseImageUrl: string;
}

const environment: Environment = {
  apiUrl: 'https://crud-api-vuea.onrender.com',
  useLocal: process.env.USE_LOCAL_STORAGE !== 'false',
  baseImageUrl:
    process.env.USE_LOCAL_STORAGE === 'false'
      ? 'https://crud-api-vuea.onrender.com'
      : 'http://localhost:1234',
};


const normalizeAvatarUrl = (avatar: string): string => {
  if (!avatar) return '';
  
  // If it's already an absolute URL, return it as is
  if (avatar.startsWith('http')) return avatar;
  
  const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
  
  return `${environment.baseImageUrl}/${cleanPath}`;
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
      const students = studentJson ? JSON.parse(studentJson) : [];

      // Normalize avatar URLs
      return students.map((student: Student) => ({
        ...student,
        avatar: normalizeAvatarUrl(student.avatar),
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
      avatar: normalizeAvatarUrl(student.avatar),
    };
  }

  async create(student: Student): Promise<Student> {
    const students = await this.getAll();
    students.push(student);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return {
      ...student,
      avatar: normalizeAvatarUrl(student.avatar),
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
      avatar: normalizeAvatarUrl(student.avatar),
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
  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/students`;
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
        avatar: normalizeAvatarUrl(item.avatar),
      })) as T;
    } else if (data && typeof data === 'object' && 'avatar' in data) {
      return {
        ...data,
        avatar: normalizeAvatarUrl(data.avatar),
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
        avatar: normalizeAvatarUrl(student.avatar),
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
        avatar: normalizeAvatarUrl(student.avatar),
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
  static create(): BaseService {
    return environment.useLocal
      ? new LocalStorageService()
      : new ApiDataService(environment.apiUrl);
  }
}

export const dataService = DataServiceEnvironment.create();
