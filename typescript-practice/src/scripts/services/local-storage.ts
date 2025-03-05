import { BaseService } from './data-service';
import Student from '../interfaces/student';
import { StudentNotFoundError } from '../helpers/error';
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
  }
}
