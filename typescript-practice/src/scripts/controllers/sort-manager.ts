import Student from '../interfaces/student';
import { StudentSort, SortConfig, SortField, SortOrder } from '../helpers/student-sort';
/**
 * SortManager class handles sorting logic.
 */
export class SortManager {
  private allStudents: Student[] = [];
  private currentSort: SortConfig = {
    field: 'name' as SortField,
    order: 'asc' as SortOrder,
  };

  constructor(private onSort: (students: Student[]) => void) {}

  /**
   * Gets the current sort configuration.
   * @returns The current sort configuration.
   */
  public getCurrentSort(): SortConfig {
    return { ...this.currentSort };
  }

  /**
   * Handles sort field change event.
   * @param field - The new sort field.
   */
  public handleSortFieldChange(field: SortField): void {
    if (!this.currentSort) {
      this.currentSort = { field, order: 'asc' };
    } else {
      this.currentSort.field = field;
    }
    this.onSort(this.sortStudents(this.allStudents));
  }

  /**
   * Handles sort button click event.
   */
  public handleSortButtonClick(): void {
    if (!this.currentSort) {
      this.currentSort = { field: 'name', order: 'asc' };
    } else {
      this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    }
    this.onSort(this.sortStudents(this.allStudents));
  }

  /**
   * Updates the data source for the sort manager
   * @param students - The new student array
   */
  public updateDataSource(students: Student[]): void {
    this.allStudents = [...students];
  }

  /**
   * Sorts the students based on the current sort configuration.
   * @param students - The array of students to sort.
   * @returns The sorted array of students.
   */
  public sortStudents(students: Student[]): Student[] {
    this.allStudents = [...students];
    return StudentSort.sortStudents(students, this.currentSort);
  }
}
