import { StudentController } from './controllers/controller';
import { initializeStudentSearch } from '../scripts/helpers/search-handler';
import { SortField } from './helpers/student-sort';
import { SortManager } from './controllers/sort-manager';
import Student from './interfaces/student';
import { DataServiceEnvironment } from '../scripts/services/data-service';

/**
 * Main application class responsible for initializing and coordinating the student management system
 */
export default class App {
  private studentController!: StudentController;
  private readonly sortManager: SortManager;

  constructor() {
    // Initialize the sort manager with a callback to handle sorted students
    this.sortManager = new SortManager((sortedStudents: Student[]) => {
      // Update the displayed students when sorting occurs
      this.studentController.updateDisplayedStudents(sortedStudents);
    });
    this.checkAuth();
  }

  /**
   * Checks if the user is authenticated and redirects to the login page if not.
   */
  checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login-page.html');

    // Force redirection if needed
    if (!isLoggedIn && !isLoginPage) {
      window.location.replace('./login-page.html');
      throw new Error('Authentication required');
    }
  }

  /**
   * Initialize the application
   */
  public async init(): Promise<void> {
    try {
      // Get the data service first
      const dataService = await DataServiceEnvironment.create();

      // Initialize the controller with the data service and bound handler methods
      this.studentController = new StudentController(dataService, {
        handleDelete: this.handleDelete,
        handleEdit: this.handleEdit,
        handleAddNew: this.handleAddNew,
        handleSortFieldChange: this.handleSortFieldChange,
      });

      await this.initializeCore();
      await this.initializeFeatures();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      // Could add error handling UI here
    }
  }

  /**
   * Initialize core functionality
   */
  private async initializeCore(): Promise<void> {
    await this.studentController.loadInitialStudents();
    this.studentController.initializeSidebarToggle();
  }

  /**
   * Initialize additional features
   */
  private async initializeFeatures(): Promise<void> {
    // Initialize search functionality
    initializeStudentSearch(this.studentController);

    // Initialize logout handler
    try {
      const { LogoutHandler } = await import('./helpers/logout-handler');
      LogoutHandler.initialize();
    } catch (error) {
      console.error('Failed to initialize logout handler:', error);
    }
  }

  /**
   * Handler for deleting a student
   */
  private handleDelete(id: string): void {
    try {
      this.studentController.handleDelete(id);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  }

  /**
   * Handler for editing a student
   */
  private handleEdit(id: string): void {
    try {
      this.studentController.handleEdit(id);
    } catch (error) {
      console.error('Error editing student:', error);
    }
  }

  /**
   * Handler for adding a new student
   */
  private handleAddNew(): void {
    try {
      this.studentController.handleAddNew();
    } catch (error) {
      console.error('Error adding new student:', error);
    }
  }

  /**
   * Handler for sort field changes
   */
  private handleSortFieldChange(field: SortField): void {
    try {
      this.sortManager.handleSortFieldChange(field);
    } catch (error) {
      console.error('Error changing sort field:', error);
    }
  }
}
