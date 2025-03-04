import Student from '../interfaces/student';
/**
 * SearchManager class handles search functionality.
 */
export class SearchManager {
  constructor(private onSearch: (students: Student[]) => void) {}

  /**
   * Searches students based on the query.
   * @param query - The search query.
   * @param allStudents - The array of all students.
   */
  public searchStudents(query: string, allStudents: Student[]): void {
    if (!query || query.trim() === '') {
      this.onSearch(allStudents);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const filteredStudents = allStudents.filter((student) =>
      this.matchesSearch(student, normalizedQuery),
    );
    this.onSearch(filteredStudents);
  }

  /**
   * Checks if a student matches the search query.
   * @param student - The student object.
   * @param query - The search query.
   * @returns True if the student matches the query, otherwise false.
   */
  private matchesSearch(student: Student, query: string): boolean {
    return (
      (student.name?.toLowerCase().includes(query) ?? false) ||
      (student.email?.toLowerCase().includes(query) ?? false) ||
      (student.phoneNum?.toLowerCase().includes(query) ?? false) ||
      (student.enrollNum?.toLowerCase().includes(query) ?? false) ||
      (student.dateAdmission?.toLowerCase().includes(query) ?? false)
    );
  }
}
