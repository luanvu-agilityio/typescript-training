import Student from '../interfaces/student';
import { StudentController } from '../controllers/controller';
import { SearchManager } from '../controllers/controller';

/**
 * Search module for student management application
 * Handles searching students across all fields
 */

export class StudentSearch {
  private controller: StudentController;
  private searchInput: HTMLInputElement;

  /**
   * Initialize the search functionality
   * @param controller - The StudentController instance
   * @param searchSelector - CSS selector for the search input element
   */
  constructor(controller: StudentController, searchSelector: string = '.content__search-input') {
    this.controller = controller;
    this.searchInput = document.querySelector(searchSelector) as HTMLInputElement;
    if (!this.searchInput) {
      console.error('Search input element not found');
      return;
    }
    this.init();
  }

  /**
   * Initialize search event listeners
   */
  private init(): void {
    // Add input event for real time search
    this.searchInput.addEventListener('input', (event) => {
      const query = (event.target as HTMLInputElement).value;
      this.search(query);
    });

    // Handle search event when search area is clear or Enter is pressed
    this.searchInput.addEventListener('search', (e) => {
      if ((e.target as HTMLInputElement).value === '') {
        this.controller.loadInitialStudents();
      }
    });
  }

  /**
   * Search students across all fields
   * @param query - Search query string
   */
  private search(query: string): void {
    try {
      // Use the controller's search method directly
      this.controller.handleSearchingQuery(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  }
}

/**
 * Helper function to initialize search on the student controller
 * @param controller - StudentController instance
 * @returns Instance of StudentSearch
 */
export function initializeStudentSearch(controller: StudentController): StudentSearch {
  return new StudentSearch(controller);
}
