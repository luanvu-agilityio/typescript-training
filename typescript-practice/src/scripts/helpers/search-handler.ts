import { StudentController } from '../controllers/controller';

/**
 * Search module for student management application
 * Handles searching students across all fields
 */

export class StudentSearch {
  private controller: StudentController;
  private searchInput: HTMLInputElement;
  private searchTimeout: number | null = null;
  private readonly eventDelay: number = 2000;
  /**
   * Initialize the search functionality
   * @param controller - The StudentController instance
   * @param searchSelector - CSS selector for the search input element
   * @param debounceDelay - Optional override for debounce delay in milliseconds
   */
  constructor(
    controller: StudentController,
    searchSelector: string = '.content__search-input',
    eventDelay: number = 1000,
  ) {
    this.controller = controller;
    this.searchInput = document.querySelector(searchSelector) as HTMLInputElement;
    this.eventDelay = eventDelay;
    if (!this.searchInput) {
      return;
    }
    this.init();
  }

  /**
   * Initialize search event listeners
   */
  private init(): void {
    // Add keyup event with debounce for search after user finishes typing
    this.searchInput.addEventListener('keyup', (event) => {
      // Clear any existing timeout
      if (this.searchTimeout) {
        window.clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }

      // Set a new timeout
      this.searchTimeout = window.setTimeout(() => {
        const query = (event.target as HTMLInputElement).value;
        this.search(query);
        this.searchTimeout = null;
      }, this.eventDelay);
    });

    // Handle search event when search area is clear or Enter is pressed
    this.searchInput.addEventListener('search', (e) => {
      // Clear any pending timeout
      if (this.searchTimeout) {
        window.clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }

      if ((e.target as HTMLInputElement).value === '') {
        this.controller.loadInitialStudents();
      } else {
        // Immediate search on Enter key
        this.search((e.target as HTMLInputElement).value);
      }
    });

    // Immediate search on Enter key
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Clear any pending timeout
        if (this.searchTimeout) {
          window.clearTimeout(this.searchTimeout);
          this.searchTimeout = null;
        }

        const query = (e.target as HTMLInputElement).value;
        this.search(query);
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
export function initializeStudentSearch(
  controller: StudentController,
  eventDelay: number = 2000,
): StudentSearch {
  return new StudentSearch(controller, '.content__search-input', eventDelay);
}
