import Student from '../interfaces/student';

export class StudentStorageService {
  private readonly STORAGE_KEY = 'all students';

  getAll(): Student[] {
    try {
      const studentsJson = localStorage.getItem(this.STORAGE_KEY);
      return studentsJson ? JSON.parse(studentsJson) : [];
    } catch (error) {
      console.error('Error retrieving students from localStorage:', error);
      return [];
    }
  }

  save(students: Student[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error('Error saving students to localStorage:', error);
    }
  }

  getById(id: string): Student | undefined {
    const students = this.getAll();
    return students.find((student) => student.id === id);
  }
}
