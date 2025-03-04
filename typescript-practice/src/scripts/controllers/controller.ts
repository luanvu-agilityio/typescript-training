import Student from '../interfaces/student';
import StudentModel from '../models/model';
import { SortDropdownHandler } from '../helpers/sort-dropdown-handler';
import { StudentFormView } from '../views/form-view';
import { StudentListView } from '../views/student-list-view';
import { ToastHandler } from '../helpers/toast-handler';
import { Validator } from '../helpers/form-validation';
import { SortField, SortOrder } from '../helpers/student-sort';
import { PaginationManager } from './pagination-manager';
import { BaseService } from '../services/data-service';
import { StorageError, StudentNotFoundError, ValidationError } from '../helpers/error';
import { AbstractController } from './abstract-controller';
import { SearchManager } from './search-manager';
import { SortManager } from './sort-manager';

/**
 * StudentController class manages student data and interactions between the model, view, and storage.
 * Extends AbstractController to inherit common functionality.
 */
export class StudentController extends AbstractController<Student, BaseService> {
  private allStudents: Student[] = [];
  // View components
  private readonly listView: StudentListView;
  private readonly formView: StudentFormView;
  private currentSearchQuery: string = '';
  // Manager classes
  private readonly paginationManager: PaginationManager;
  private readonly sortManager: SortManager;
  private readonly searchManager: SearchManager;
  private sortDropdownHandler: SortDropdownHandler;

  constructor(
    dataService: BaseService,
    handlers: {
      handleDelete: (id: string) => void;
      handleEdit: (id: string) => void;
      handleAddNew: () => void;
      handleSortFieldChange: (field: SortField) => void;
    },
  ) {
    super(dataService);

    // Initialize managers with their callback functions
    this.paginationManager = new PaginationManager(this.updateDisplayedStudents.bind(this));
    this.sortManager = new SortManager(this.handleSort.bind(this));
    this.searchManager = new SearchManager(this.handleSearch.bind(this));

    // Initialize views with their event handlers
    this.listView = new StudentListView(
      this.handleDelete.bind(this),
      this.handleEdit.bind(this),
      this.handleAddNew.bind(this),
      (field: SortField) => this.sortManager.handleSortFieldChange(field),
    );

    this.formView = new StudentFormView(
      this.handleSave.bind(this),
      this.handleCancel.bind(this),
      async () => await this.getAll(),
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
   * Initializes the controller and loads initial data
   */
  public async initialize(): Promise<void> {
    await this.loadInitialStudents();
    this.initializeSidebarToggle();
  }

  /**
   * Loads the initial list of students and renders them in the list view.
   */
  async loadInitialStudents(): Promise<void> {
    try {
      this.loadingSpinner.show();
      this.allStudents = await this.getAll();
      this.renderStudents();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loadingSpinner.hide();
    }
  }

  /**
   * Handles search query input.
   * @param query - The search query.
   */
  public async handleSearchingQuery(query: string): Promise<void> {
    try {
      this.currentSearchQuery = query;
      const allStudents = await this.getAll();
      this.searchManager.searchStudents(query, allStudents);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loadingSpinner.hide();
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
   * Handles action of adding new student by showing add student form
   */
  public handleAddNew(): void {
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
  public async handleEdit(id: string): Promise<void> {
    try {
      const student = await this.getById(id);
      this.formView.showEditForm(student);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles action of deleting a student by showing the confirmation dialog
   * @param id - the id of student to delete
   */
  public async handleDelete(id: string): Promise<void> {
    try {
      const student = await this.getById(id);
      ToastHandler.showConfirmation(
        'Confirm Deletion',
        `Are you sure you want to delete this student: ${student.name}?`,
        async () => {
          try {
            await this.delete(id);
            this.loadingSpinner.show();
            // Get current pagination state before refresh
            const { page, itemsPerPage } = this.paginationManager.getCurrentState();

            // Get updated student list
            const updatedStudents = await this.getAll();

            // Calculate total page after deletion
            const totalPages = Math.max(1, Math.ceil(updatedStudents.length / itemsPerPage));

            // if current page is greater that total page after deletion, go to previous page
            if (page > totalPages && page > 1) {
              this.paginationManager.handlePageChange(page - 1, itemsPerPage);
            }

            if (this.currentSearchQuery) {
              await this.handleSearchingQuery(this.currentSearchQuery);
            } else {
              await this.renderStudents(true);
            }

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

  // Add a getter for the list view
  public getListView(): StudentListView {
    return this.listView;
  }

  /**
   * Sidebar toggle function
   */
  public initializeSidebarToggle(): void {
    const sidebarToggleButton = document.querySelector('#sidebarToggle');
    const sidebar = document.querySelector('.sidebar') as HTMLElement;

    if (sidebarToggleButton && sidebar) {
      sidebarToggleButton.addEventListener('click', (e) => {
        sidebar.classList.toggle('expanded');
      });
    }
  }

  /**
   * Handles sort event.
   * @param students - The sorted array of students.
   */
  private handleSort(students: Student[]): void {
    this.allStudents = students;
    this.paginationManager.updateData(this.allStudents);
  }

  /**
   * Handles search event.
   * @param students - The filtered array of students.
   */
  private handleSearch(students: Student[]): void {
    // Update the allStudents array with the filtered results
    this.allStudents = students;

    // Update pagination with the new dataset (this will trigger UI update)
    this.paginationManager.updateData(this.allStudents);
  }

  /**
   * Renders the list of students in the table body.
   * @param preservePage - Whether to preserve current page after update (default: false)
   */
  private async renderStudents(preservePage: boolean = false): Promise<void> {
    try {
      // Get and update all students
      this.allStudents = await this.getAll();

      // Update sort manager's data source
      this.sortManager.updateDataSource(this.allStudents);

      // Apply current sort
      const sortedStudents = this.sortManager.sortStudents(this.allStudents);

      // Update pagination with new dataset
      this.paginationManager.updateData(sortedStudents);

      // Update sort UI
      this.sortDropdownHandler.updateSortUI(this.sortManager.getCurrentSort());
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles the save action for adding or updating a student.
   * @param studentData - The data of the student to save.
   */
  private async handleSave(studentData: Partial<Student>): Promise<void> {
    try {
      const allStudents = await this.executeOperation(
        async () => await this.getAll(),
        'Failed to retrieve students for validation',
        false,
      );
      const { isValid, errors } = Validator.validateForm(studentData, allStudents);

      if (!isValid) {
        throw new ValidationError(errors);
      }
      this.loadingSpinner.show();

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
      await this.create(newStudent);

      if (this.currentSearchQuery) {
        await this.handleSearchingQuery(this.currentSearchQuery);
      } else {
        await this.renderStudents();
      }

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

      const existingStudent = await this.getById(studentData.id);
      const updatedStudent = new StudentModel({
        ...existingStudent,
        ...studentData,
      });

      await this.update(updatedStudent);

      if (this.currentSearchQuery) {
        await this.handleSearchingQuery(this.currentSearchQuery);
      } else {
        await this.renderStudents(true);
      }

      ToastHandler.show('success', 'Success', 'Student updated successfully');
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw error;
      }
      throw new StorageError(`Failed to update student: ${this.getErrorMessage(error)}`);
    }
  }
}
