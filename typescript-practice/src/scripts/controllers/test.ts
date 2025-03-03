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
 * Custom error classes
 */
export class StudentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentError';
  }
}

export class StudentNotFoundError extends StudentError {
  constructor(id: string) {
    super(`Student with ID ${id} not found`);
    this.name = 'StudentNotFoundError';
  }
}

export class ValidationError extends StudentError {
  public errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class StorageError extends StudentError {
  constructor(message: string) {
    super(`Storage operation failed: ${message}`);
    this.name = 'StorageError';
  }
}

/**
 * ErrorHandler class handles different types of errors
 */
export class ErrorHandler {
  /**
   * Handles errors by displaying appropriate messages and logging the error.
   * @param error - The error object.
   */
  public handleError(error: unknown): void {
    const errorMessage = this.getErrorMessage(error);
    console.error('Error:', error);

    if (error instanceof ValidationError) {
      throw error;
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
  private getErrorMessage(error: unknown): string {
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
 * StudentDataService handles all data-related operations
 */
export class StudentDataService {
  constructor(
    private readonly dataService: BaseService,
    private errorHandler: ErrorHandler,
  ) {}

  /**
   * Retrieves all students from storage.
   * @returns An array of students.
   */
  public async getAllStudents(): Promise<Student[]> {
    try {
      return await this.dataService.getAll();
    } catch (error) {
      throw new StorageError(`Failed to retrieve students: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Retrieves a student by ID from storage.
   * @param id - The ID of the student to retrieve.
   * @returns The student object if found.
   */
  public async getStudentById(id: string): Promise<Student> {
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
   * Creates a new student
   * @param studentData - The data for the new student
   */
  public async createStudent(studentData: Partial<Student>): Promise<void> {
    try {
      const newStudent = new StudentModel(studentData);
      await this.dataService.create(newStudent);
    } catch (error) {
      throw new StorageError(`Failed to create student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Updates an existing student
   * @param studentData - The updated student data
   */
  public async updateStudent(studentData: Partial<Student>): Promise<void> {
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
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      throw new StorageError(`Failed to update student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Deletes a student
   * @param id - The ID of the student to delete
   */
  public async deleteStudent(id: string): Promise<void> {
    try {
      await this.dataService.delete(id);
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      throw new StorageError(`Failed to delete student: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Gets error message from error object
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

/**
 * FormHandler manages form-related operations
 */
export class FormHandler {
  constructor(
    private formView: StudentFormView,
    private dataService: StudentDataService,
    private errorHandler: ErrorHandler,
    private onSuccessfulSave: () => Promise<void>,
  ) {}

  /**
   * Shows form for adding new student
   */
  public showAddForm(): void {
    try {
      this.formView.showAddForm();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Shows form for editing student
   * @param id - ID of student to edit
   */
  public async showEditForm(id: string): Promise<void> {
    try {
      const student = await this.dataService.getStudentById(id);
      this.formView.showEditForm(student);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Handles save action
   * @param studentData - Data to save
   */
  public async handleSave(studentData: Partial<Student>): Promise<void> {
    const loadingSpinner = LoadingSpinner.getInstance();
    try {
      loadingSpinner.show();

      // Validate form data
      const allStudents = await this.dataService.getAllStudents();
      const { isValid, errors } = Validator.validateForm(studentData, allStudents);
      if (!isValid) {
        throw new ValidationError(errors);
      }

      // Create or update student
      if (studentData.id) {
        await this.dataService.updateStudent(studentData);
        ToastHandler.show('success', 'Success', 'Student updated successfully');
      } else {
        await this.dataService.createStudent(studentData);
        ToastHandler.show('success', 'Success', 'Student added successfully');
      }

      // Hide form and refresh data
      this.formView.hide();
      await this.onSuccessfulSave();
    } catch (error) {
      if (error instanceof ValidationError) {
        this.formView.showErrors(error.errors);
      } else {
        this.errorHandler.handleError(error);
      }
    } finally {
      loadingSpinner.hide();
    }
  }

  /**
   * Handles cancel action
   */
  public handleCancel(): void {
    try {
      this.formView.hide();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}

/**
 * UIManager handles UI-related operations
 */
export class UIManager {
  /**
   * Initializes sidebar toggle functionality
   */
  public initializeSidebarToggle(): void {
    const sidebarToggleButton = document.querySelector('#sidebarToggle');
    const sidebar = document.querySelector('.sidebar') as HTMLElement;

    if (sidebarToggleButton && sidebar) {
      sidebarToggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
      });
    }
  }
}

/**
 * StudentController class coordinates between different components
 */
export class StudentController {
  private allStudents: Student[] = [];
  private loadingSpinner: LoadingSpinner;
  private errorHandler: ErrorHandler;
  private dataService: StudentDataService;
  private formHandler: FormHandler;
  private uiManager: UIManager;

  // Manager classes
  private readonly paginationManager: PaginationManager;
  private readonly sortManager: SortManager;
  private readonly searchManager: SearchManager;
  private readonly sortDropdownHandler: SortDropdownHandler;

  // Views
  private readonly listView: StudentListView;
  private readonly formView: StudentFormView;

  constructor(baseService: BaseService) {
    // Initialize core components
    this.loadingSpinner = LoadingSpinner.getInstance();
    this.errorHandler = new ErrorHandler();
    this.dataService = new StudentDataService(baseService, this.errorHandler);
    this.uiManager = new UIManager();

    // Initialize managers with their callback functions
    this.paginationManager = new PaginationManager(this.updateDisplayedStudents.bind(this));
    this.sortManager = new SortManager(this.handleSort.bind(this));
    this.searchManager = new SearchManager(this.handleSearch.bind(this));

    // Initialize views
    this.listView = new StudentListView(
      this.handleDelete.bind(this),
      this.handleEdit.bind(this),
      this.handleAddNew.bind(this),
      (field: SortField) => this.sortManager.handleSortFieldChange(field),
    );

    this.formView = new StudentFormView(
      this.handleSave.bind(this),
      this.handleCancel.bind(this),
      async () => await this.dataService.getAllStudents(),
    );

    // Initialize form handler
    this.formHandler = new FormHandler(
      this.formView,
      this.dataService,
      this.errorHandler,
      this.renderStudents.bind(this),
    );

    // Initialize sort dropdown handler
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
   * Loads the initial list of students and renders them
   */
  public async loadInitialStudents(): Promise<void> {
    try {
      this.loadingSpinner.show();
      this.allStudents = await this.dataService.getAllStudents();
      await this.renderStudents();
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Handles search query
   * @param query - Search query
   */
  public async handleSearchingQuery(query: string): Promise<void> {
    try {
      this.loadingSpinner.show();
      const allStudents = await this.dataService.getAllStudents();
      this.searchManager.searchStudents(query, allStudents);
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Updates displayed students
   * @param students - Students to display
   */
  public updateDisplayedStudents(students: Student[]): void {
    this.listView.renderStudentTable(students);
  }

  /**
   * Handles adding new student
   */
  public handleAddNew(): void {
    this.formHandler.showAddForm();
  }

  /**
   * Handles editing student
   * @param id - ID of student to edit
   */
  public async handleEdit(id: string): Promise<void> {
    await this.formHandler.showEditForm(id);
  }

  /**
   * Handles deleting student
   * @param id - ID of student to delete
   */
  public handleDelete(id: string): void {
    try {
      ToastHandler.showConfirmation(
        'Confirm Deletion',
        'Are you sure you want to delete this student?',
        async () => {
          try {
            this.loadingSpinner.show();
            await this.dataService.deleteStudent(id);
            await this.renderStudents(true);
            ToastHandler.show('success', 'Success', 'Student deleted successfully');
          } catch (error) {
            this.errorHandler.handleError(error);
          } finally {
            this.loadingSpinner.hide();
          }
        },
        () => {},
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Handles saving student
   * @param studentData - Student data to save
   */
  private async handleSave(studentData: Partial<Student>): Promise<void> {
    await this.formHandler.handleSave(studentData);
  }

  /**
   * Handles canceling form
   */
  private handleCancel(): void {
    this.formHandler.handleCancel();
  }

  /**
   * Gets the list view
   */
  public getListView(): StudentListView {
    return this.listView;
  }

  /**
   * Initializes the sidebar toggle
   */
  public initializeSidebarToggle(): void {
    this.uiManager.initializeSidebarToggle();
  }

  /**
   * Handles sort event
   * @param students - Sorted students
   */
  private handleSort(students: Student[]): void {
    this.allStudents = students;
    this.paginationManager.updateData(this.allStudents);
  }

  /**
   * Handles search event
   * @param students - Filtered students
   */
  private handleSearch(students: Student[]): void {
    this.allStudents = students;
    this.paginationManager.updateData(this.allStudents);
  }

  /**
   * Renders students
   * @param preservePage - Whether to preserve current page
   */
  private async renderStudents(preservePage: boolean = false): Promise<void> {
    try {
      // Get and update all students
      this.allStudents = await this.dataService.getAllStudents();

      // Update sort manager's data source
      this.sortManager.updateDataSource(this.allStudents);

      // Apply current sort
      const sortedStudents = this.sortManager.sortStudents(this.allStudents);

      // Update pagination with new dataset
      this.paginationManager.updateData(sortedStudents);

      // Update sort UI
      this.sortDropdownHandler.updateSortUI(this.sortManager.getCurrentSort());
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
