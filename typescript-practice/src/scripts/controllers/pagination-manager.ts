import { Pagination } from '../helpers/pagination';
import Student from '../interfaces/student';
/**
 * PaginationManager class handles pagination logic.
 */
export class PaginationManager {
  private currentPage: number = 1;
  private itemsPerPage: number = 5;
  private pagination: Pagination;
  private allStudents: Student[] = [];

  constructor(private onDisplayUpdate: (students: Student[]) => void) {
    this.pagination = new Pagination('.pagination', this.handlePageChange.bind(this));
  }

  /**
   * Updates the dataset and recalculates pagination
   * @param students - the array of students to update
   */
  public updateData(students: Student[]): void {
    this.allStudents = students;
    this.pagination.updateTotalItems(students.length);
    this.updateDisplayedStudents();
  }

  /**
   * Handles page change event.
   * @param page - The new page number.
   * @param itemsPerPage - The number of items per page.
   */
  public handlePageChange(page: number, itemsPerPage: number): void {
    this.currentPage = page;
    this.itemsPerPage = itemsPerPage;
    this.updateDisplayedStudents();
  }

  /**
   * Updates the displayed students based on current pagination state
   */
  private updateDisplayedStudents(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allStudents.length);
    const pagedStudents = this.allStudents.slice(startIndex, endIndex);
    this.onDisplayUpdate(pagedStudents);
  }

  /**
   * Gets current pagination state
   * returns the current pagination state
   */
  public getCurrentState(): { page: number; itemsPerPage: number } {
    return {
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    };
  }
}
