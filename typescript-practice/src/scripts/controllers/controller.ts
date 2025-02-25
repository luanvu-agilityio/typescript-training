import Student from '../interfaces/student';
import StudentModel from '../models/model';
import { SortDropdownHandler } from '../helpers/sort-dropdown-handler';
import { StudentFormView } from '../views/form-view';
import { StudentListView } from '../views/student-list-view';
import { ToastHandler } from '../helpers/toast-handler';
import { Validator } from '../helpers/form-validation';
import { StudentSort, SortConfig, SortField, SortOrder } from '../helpers/student-sort';
import { LoadingSpinner } from '../helpers/loading-spinner';
import { Pagination } from '../helpers/pagination';
import { BaseService } from '../services/data-service';
/**
 * Custom error class to handle student related errors
 */

export class StudentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentError';
  }
}

/**
 * Custom class to handle the case where student is not found
 */
export class StudentNotFoundError extends StudentError {
  constructor(id: string) {
    super(`Student with ID ${id} not found`);
    this.name = 'StudentNotFoundError';
  }
}

/**
 * Custom class to handle validation errors
 */
export class ValidationError extends StudentError {
  public errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Custom class to handle storage related errors
 */
export class StorageError extends StudentError {
  constructor(message: string) {
    super(`Storage operation failed: ${message}`);
    this.name = 'StorageError';
  }
}

/**
 * BaseController class provides common functionality for handling errors and loading spinner.
 */
abstract class BaseController {
  protected loadingSpinner: LoadingSpinner;

  constructor() {
    this.loadingSpinner = LoadingSpinner.getInstance();
  }

  /**
   * Handles errors by displaying appropriate messages and logging the error.
   * @param error - The error object.
   */ protected handleError(error: unknown): void {
    const errorMessage = this.getErrorMessage(error);
    console.error('Error:', error);

    if (error instanceof ValidationError) {
      throw error; // Let specific controllers handle validation errors
    } else if (error instanceof StudentNotFoundError) {
      ToastHandler.show('error', 'Student Not Found', errorMessage);
    } else if (error instanceof StorageError) {
      ToastHandler.show('error', 'Storage Error', errorMessage);
    } else {
      ToastHandler.show('error', 'System Error', `An unexpected error occurred: ${errorMessage}`);
    }
  }

  /**
   * Retrieves the error message from an error object.
   * @param error - The error object.
   * @returns The error message.
   */
  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

/**
 * PaginationManager class handles pagination logic.
 */
class PaginationManager {
  private currentPage: number = 1;
  private itemsPerPage: number = 5;
  private pagination: Pagination;
  private allStudents: Student[] = [];

  constructor(private onDisplayUpdate: (students: Student[]) => void) {
    this.pagination = new Pagination('.pagination', this.handlePageChange.bind(this));
  }

  /**
   * Updates the dataset and recalculates pagination
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
   */
  public getCurrentState(): { page: number; itemsPerPage: number } {
    return {
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    };
  }
}

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
    if (this.currentSort.field !== field) {
      this.currentSort.field = field;
      this.onSort(this.sortStudents(this.allStudents));
    }
  }

  /**
   * Handles sort button click event.
   */
  public handleSortButtonClick(): void {
    this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    this.onSort(this.sortStudents(this.allStudents));
  }

  /**
   * Sets the sort order directly.
   * @param order - The sort order to set
   */

  public setSortOrder(order: SortOrder): void {
    if (this.currentSort.order !== order) {
      this.currentSort.order = order;
      this.onSort(this.sortStudents(this.allStudents));
    }
  }

  /**
   * Sets the complete sort configuration.
   * @param config - The sort configuration to set
   */

  public setSortConfig(config: SortConfig): void {
    if (this.currentSort.field !== config.field && this.currentSort.order !== config.order) {
      this.currentSort = { ...config };
      this.onSort(this.sortStudents(this.allStudents));
    }
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

/**
 * StudentController class manages student data and interactions between the model, view, and storage.
 */
export class StudentController extends BaseController {
  private allStudents: Student[] = [];
  private readonly dataService: BaseService;
  private readonly paginationManager: PaginationManager;
  private readonly sortManager: SortManager;
  private readonly searchManager: SearchManager;
  private readonly listView: StudentListView;
  private readonly formView: StudentFormView;
  private sortDropdownHandler: SortDropdownHandler;
  constructor(
    dataService: BaseService,
    handlers: {
      handleDelete: (id: string) => void;
      handleEdit: (id: string) => void;
      handleAddNew: () => void;
      handleSortButtonClick: () => void;
      handleSortFieldChange: (field: SortField) => void;
    },
  ) {
    super();

    this.dataService = dataService;

    // Initialize managers
    this.paginationManager = new PaginationManager(this.updateDisplayedStudents.bind(this));
    this.sortManager = new SortManager(this.handleSort.bind(this));
    this.searchManager = new SearchManager(this.handleSearch.bind(this));

    // Initialize views
    this.listView = new StudentListView(
      this.handleDelete.bind(this),
      this.handleEdit.bind(this),
      this.handleAddNew.bind(this),
    );

    this.formView = new StudentFormView(this.handleSave.bind(this), this.handleCancel.bind(this));

    this.sortDropdownHandler = new SortDropdownHandler((field: SortField, order: SortOrder) => {
      // Update sort manager with the new field and order
      if (field !== this.sortManager.getCurrentSort().field) {
        this.sortManager.handleSortFieldChange(field);
      }
      if (order !== this.sortManager.getCurrentSort().order) {
        this.sortManager.handleSortButtonClick();
      }
    }, this.sortManager.getCurrentSort());
  }

  /**
   * Loads the initial list of students and renders them in the list view.
   */
  async loadInitialStudents(): Promise<void> {
    try {
      this.loadingSpinner.show();
      this.allStudents = await this.getAllStudents();
      this.renderStudents();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Handles sort event.
   * @param students - The sorted array of students.
   */
  private handleSort(students: Student[]): void {
    this.allStudents = students;
    this.renderStudents(true);
  }

  /**
   * Handles search event.
   * @param students - The filtered array of students.
   */
  private handleSearch(students: Student[]): void {
    this.allStudents = students;
    this.renderStudents();
  }

  /**
   * Handles search query input.
   * @param query - The search query.
   */
  public async handleSearchingQuery(query: string): Promise<void> {
    try {
      const allStudents = await this.getAllStudents();
      this.searchManager.searchStudents(query, allStudents);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Renders the list of students in the table body.
   * @param students - An array of students to render.
   *  @param preservePage - Whether to preserve current page after update (default: false)
   */

  private async renderStudents(preservePage: boolean = false): Promise<void> {
    try {
      // Get and update all students
      this.allStudents = await this.getAllStudents();
      // Apply current sort
      this.allStudents = this.sortManager.sortStudents(this.allStudents);

      // Update pagination with new dataset
      this.paginationManager.updateData(this.allStudents);
      // Update sort UI

      this.sortDropdownHandler.updateSortUI(this.sortManager.getCurrentSort());
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Updates the displayed students in the list view.
   * @param students - The array of students to display.
   */
  public updateDisplayedStudents(students: Student[]): void {
    this.listView.renderStudentTable(students);
  }

  /**
   * Handles the save action for adding or updating a student.
   * @param studentData - The data of the student to save.
   */
  private async handleSave(studentData: Partial<Student>): Promise<void> {
    try {
      this.loadingSpinner.show();

      const { isValid, errors } = Validator.validateForm(studentData);
      if (!isValid) {
        throw new ValidationError(errors);
      }

      if (studentData.id) {
        await this.updateExistingStudent(studentData);
      } else {
        await this.createNewStudent(studentData);
      }

      this.formView.hide();
    } catch (error) {
      if (error instanceof ValidationError) {
        this.formView.showErrors(error.errors);
      } else {
        this.handleError(error);
      }
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Handles action of cancelling the form by hiding it
   */
  private handleCancel(): void {
    try {
      this.formView.hide();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Creates a new student and adds it to the storage.
   * @param studentData - The data of the new student.
   */
  private async createNewStudent(studentData: Partial<Student>): Promise<void> {
    try {
      const newStudent = new StudentModel(studentData);
      await this.dataService.create(newStudent);
      await this.renderStudents();
      ToastHandler.show('success', 'Success', 'Student added successfully');
    } catch (error) {
      throw new StorageError(`Failed to create student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Updates an existing student in the storage.
   * @param studentData - The data of the student to update.
   */
  private async updateExistingStudent(studentData: Partial<Student>): Promise<void> {
    try {
      if (!studentData.id) {
        throw new Error('Student ID is required for update');
      }

      const existingStudent = await this.getStudentById(studentData.id);
      const updatedStudent = new StudentModel({
        ...existingStudent,
        ...studentData,
      });

      await this.dataService.update(updatedStudent);
      this.renderStudents(true);
      ToastHandler.show('success', 'Success', 'Student updated successfully');
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      throw new StorageError(`Failed to update student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Retrieves all students from storage.
   * @returns An array of students.
   */
  private async getAllStudents(): Promise<Student[]> {
    try {
      return await this.dataService.getAll();
    } catch (error) {
      throw new StorageError(`Failed to retrieve students: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Retrieves a student by ID from storage.
   * @param id - The ID of the student to retrieve.
   * @returns The student object if found, otherwise undefined.
   */
  private async getStudentById(id: string): Promise<Student> {
    try {
      const student = await this.dataService.getById(id);
      if (!student) {
        throw new StudentNotFoundError(id);
      }
      return student;
    } catch (error) {
      throw new StorageError(`Failed to retrieve student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Handles action of adding new student by showing add student form
   */
  handleAddNew(): void {
    try {
      this.formView.showAddForm();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   *  Handles action of editing student by showing edit student form
   * @param id - id of student to edit
   */
  async handleEdit(id: string): Promise<void> {
    try {
      const student = await this.getStudentById(id);
      if (!student) {
        throw new StudentNotFoundError(id);
      }
      this.formView.showEditForm(student);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles action of deleting a student by showing the confirmation dialog
   * @param id - the id of student to delete
   */
  handleDelete(id: string): void {
    try {
      ToastHandler.showConfirmation(
        'Confirm Deletion',
        'Are you sure you want to delete this student?',
        async () => {
          try {
            this.loadingSpinner.show();
            await this.deleteStudent(id);

            await this.renderStudents(true);

            ToastHandler.show('success', 'Success', 'Student deleted successfully');
          } catch (error) {
            this.handleError(error);
          } finally {
            this.loadingSpinner.hide();
          }
        },
        () => {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Deletes a student from storage
   * @param id: id of student to delete
   * @return an array of student excluding the deleted student
   */
  private async deleteStudent(id: string): Promise<void> {
    try {
      await this.dataService.delete(id);
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      throw new StorageError(`Failed to delete student: ${this.getErrorMessage(error)}`);
    }
  }

  // Add a getter for the list view
  public getListView(): StudentListView {
    return this.listView;
  }

  /**
   * Sidebar toggle function
   */
  initializeSidebarToggle(): void {
    const sidebarToggleButton = document.querySelector('#sidebarToggle');
    const sidebar = document.querySelector('.sidebar') as HTMLElement;

    if (sidebarToggleButton && sidebar) {
      sidebarToggleButton.addEventListener('click', (e) => {
        sidebar.classList.toggle('expanded');
      });
    }
  }
}
