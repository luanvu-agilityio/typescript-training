import Student from '../interfaces/student';

export type SortField = 'name' | 'email' | 'phoneNum' | 'enrollNum' | 'dateAdmission';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
export class StudentSort {
  /**
   * Sorts an array of students based on the specified field and order
   * @param students - Array of students to sort
   * @param field - Field to sort by
   * @param order - Sort order (asc or desc)
   * @returns Sorted array of students
   */
  static sortStudents(students: Student[], config: SortConfig): Student[] {
    const { field, order } = config;

    return [...students].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'phoneNum':
          comparison = (a.phoneNum || '').localeCompare(b.phoneNum || '');
          break;
        case 'enrollNum':
          comparison = (a.enrollNum || '').localeCompare(b.enrollNum || '');
          break;
        case 'dateAdmission':
          const dateA = a.dateAdmission ? new Date(a.dateAdmission) : new Date(0);
          const dateB = b.dateAdmission ? new Date(b.dateAdmission) : new Date(0);
          comparison = dateA.getTime() - dateB.getTime();
          break;
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }
}
