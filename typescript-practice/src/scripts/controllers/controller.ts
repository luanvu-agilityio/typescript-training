import Student from '../interfaces/student';
import StudentModel from '../models/model';
import { StudentStorageService } from '../services/local-storage';
import { StudentFormView } from '../views/form-view';
import { StudentListView } from '../views/student-list-view';
import { ToastHandler } from '../helpers/toast-handler';
import { Validator } from '../helpers/form-validation';
import { StudentSort, SortConfig, SortField, SortOrder } from '../helpers/student-sort';
import { LoadingSpinner } from '../helpers/loading-spinner';
import { Pagination } from '../helpers/pagination';
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
abstract class BaseController {
  protected loadingSpinner: LoadingSpinner;

  constructor() {
    this.loadingSpinner = LoadingSpinner.getInstance();
  }

  protected handleError(error: unknown): void {
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

  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

// Handles pagination logic
class PaginationManager {
  private currentPage: number = 1;
  private itemsPerPage: number = 5;
  private pagination: Pagination;

  constructor(private onPageChange: (students: Student[]) => void) {
    this.pagination = new Pagination('.pagination', this.handlePageChange.bind(this));
  }

  public handlePageChange(page: number, itemsPerPage: number): void {
    this.currentPage = page;
    this.itemsPerPage = itemsPerPage;
    this.updatePage();
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }

  public getItemsPerPage(): number {
    return this.itemsPerPage;
  }

  public updateTotalItems(total: number): void {
    this.pagination.updateTotalItems(total);
  }

  private updatePage(): void {
    // Notify controller of page change
    this.onPageChange(this.getPagedStudents([]));
  }

  public getPagedStudents(students: Student[]): Student[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, students.length);
    return students.slice(startIndex, endIndex);
  }
}

// Handles sorting logic
export class SortManager {
  private allStudents: Student[] = [];
  private currentSort: SortConfig = {
    field: 'name' as SortField,
    order: 'asc' as SortOrder,
  };

  constructor(private onSort: (students: Student[]) => void) {}

  public getCurrentSort(): SortConfig {
    return { ...this.currentSort };
  }

  public handleSortFieldChange(field: SortField): void {
    if (!this.currentSort) {
      this.currentSort = { field, order: 'asc' };
    } else {
      this.currentSort.field = field;
    }
    this.onSort(this.sortStudents(this.allStudents));
  }

  public handleSortButtonClick(): void {
    if (!this.currentSort) {
      this.currentSort = { field: 'name', order: 'asc' };
    } else {
      this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    }
    this.onSort(this.sortStudents(this.allStudents));
  }

  public sortStudents(students: Student[]): Student[] {
    this.allStudents = [...students];
    return StudentSort.sortStudents(students, this.currentSort);
  }
}

// Handles search functionality
export class SearchManager {
  constructor(private onSearch: (students: Student[]) => void) {}

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

// Main StudentController class
export class StudentController extends BaseController {
  private allStudents: Student[] = [];

  private readonly paginationManager: PaginationManager;
  private readonly sortManager: SortManager;
  private readonly searchManager: SearchManager;
  private readonly storageService: StudentStorageService;
  private readonly listView: StudentListView;
  private readonly formView: StudentFormView;

  constructor(handlers: {
    handleDelete: (id: string) => void;
    handleEdit: (id: string) => void;
    handleAddNew: () => void;
    handleSortButtonClick: () => void;
    handleSortFieldChange: (field: SortField) => void;
  }) {
    super();

    this.storageService = new StudentStorageService();

    // Initialize managers
    this.paginationManager = new PaginationManager(this.handlePageChange.bind(this));
    this.sortManager = new SortManager(this.handleSort.bind(this));
    this.searchManager = new SearchManager(this.handleSearch.bind(this));

    // Initialize views
    this.listView = new StudentListView(
      this.handleDelete.bind(this),
      this.handleEdit.bind(this),
      this.handleAddNew.bind(this),
      () => this.sortManager.handleSortButtonClick(),
      (field: SortField) => this.sortManager.handleSortFieldChange(field),
    );

    this.formView = new StudentFormView(this.handleSave.bind(this), this.handleCancel.bind(this));
  }

  public loadInitialStudents(): void {
    try {
      this.loadingSpinner.show();
      this.allStudents = this.getAllStudents();
      this.renderStudents();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  private handlePageChange(students: Student[]): void {
    const displayedStudents = this.paginationManager.getPagedStudents(this.allStudents);
    this.updateDisplayedStudents(displayedStudents);
  }

  private handleSort(students: Student[]): void {
    this.renderStudents(true);
  }

  private handleSearch(students: Student[]): void {
    this.allStudents = students;
    this.renderStudents();
  }

  public handleSearchingQuery(query: string): void {
    const allStudents = this.getAllStudents();
    this.searchManager.searchStudents(query, allStudents);
  }

  private renderStudents(preservePage: boolean = false): void {
    try {
      // Apply current sort
      this.allStudents = this.getAllStudents();
      this.allStudents = this.sortManager.sortStudents(this.allStudents);

      // Update pagination
      this.paginationManager.updateTotalItems(this.allStudents.length);

      // Get current page of students
      const displayedStudents = this.paginationManager.getPagedStudents(this.allStudents);

      // Update view
      this.updateDisplayedStudents(displayedStudents);
      this.listView.updateSortUI(this.sortManager.getCurrentSort());
    } catch (error) {
      this.handleError(error);
    }
  }

  public updateDisplayedStudents(students: Student[]): void {
    this.listView.renderStudentTable(students);
  }

  // Student CRUD operations
  private handleSave(studentData: Partial<Student>): void {
    try {
      this.loadingSpinner.show();

      const { isValid, errors } = Validator.validateForm(studentData);
      if (!isValid) {
        throw new ValidationError(errors);
      }

      if (studentData.id) {
        this.updateExistingStudent(studentData);
      } else {
        this.createNewStudent(studentData);
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

  private createNewStudent(studentData: Partial<Student>): void {
    const newStudent = new StudentModel(studentData);
    this.addStudent(newStudent);
    this.renderStudents();
    ToastHandler.show('success', 'Success', 'Student added successfully');
  }

  private updateExistingStudent(studentData: Partial<Student>): void {
    const existingStudent = this.getStudentById(studentData.id!);
    if (!existingStudent) {
      throw new StudentNotFoundError(studentData.id!);
    }

    const updatedStudent = new StudentModel({
      ...existingStudent,
      ...studentData,
    });

    this.updateStudent(updatedStudent);
    this.renderStudents(true);
    ToastHandler.show('success', 'Success', 'Student updated successfully');
  }

  // Storage operations remain similar but are now more focused
  private getAllStudents(): Student[] {
    try {
      return this.storageService.getAll();
    } catch (error) {
      throw new StorageError(`Failed to retrieve students: ${this.getErrorMessage(error)}`);
    }
  }

  private getStudentById(id: string): Student | undefined {
    try {
      const student = this.storageService.getById(id);
      if (!student) {
        throw new StudentNotFoundError(id);
      }
      return student;
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        return undefined;
      }
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
  handleEdit(id: string): void {
    try {
      const student = this.getStudentById(id);
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
        () => {
          try {
            this.loadingSpinner.show();
            this.deleteStudent(id);

            this.renderStudents(true); // Preserve page on delete

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
   * Adds new student to the storage
   * @param student - student to add
   * @return array of student including the newly added student
   */
  private addStudent(student: Student): Student[] {
    try {
      const students = this.getAllStudents();
      this.loadingSpinner.show();
      students.push(student);
      this.saveToStorage(students);
      return students;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new StorageError(`Failed to add student: ${errorMessage}`);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Updates an existing student in storage
   * @param updatedStudent - student with updated data
   * @return array of student including updated student
   */
  private updateStudent(updatedStudent: Student): void {
    try {
      const students = this.getAllStudents();
      const index = students.findIndex((student) => student.id === updatedStudent.id);

      if (index === -1 || !updatedStudent.id) {
        throw new StudentNotFoundError(updatedStudent.id || 'unknown');
      }

      students[index] = updatedStudent;
      this.loadingSpinner.show();
      this.saveToStorage(students);
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      const errorMessage = this.getErrorMessage(error);
      throw new StorageError(`Failed to update student: ${errorMessage}`);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Deletes a student from storage
   * @param id: id of student to delete
   * @return an array of student excluding the deleted student
   */
  private deleteStudent(id: string): void {
    try {
      const students = this.getAllStudents();
      const filteredStudents = students.filter((student) => student.id !== id);

      if (filteredStudents.length === students.length) {
        throw new StudentNotFoundError(id);
      }
      this.loadingSpinner.show();
      this.saveToStorage(filteredStudents);
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      const errorMessage = this.getErrorMessage(error);

      throw new StorageError(`Failed to delete student: ${errorMessage}`);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Saves the list of student to storage
   * @param students - the list of student to save
   */
  private saveToStorage(students: Student[]): void {
    try {
      this.storageService.save(students);
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new StorageError(`Failed to save students: ${errorMessage}`);
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
