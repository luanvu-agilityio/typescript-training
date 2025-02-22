import Student from '../interfaces/student';
import { studentRowTemplate } from '../templates/student-list';

import { SortConfig, SortField, SortOrder } from '../helpers/student-sort';
// Import sort icons
// @ts-expect-error
import sortUpIcon from '../../assets/icons/topbar-icons/sort-up.png';
// @ts-expect-error
import sortDownIcon from '../../assets/icons/topbar-icons/sort-down.png';

/**
 * Responsible for rendering the list of students and handling user interaction with the list
 */
export class StudentListView {
  private tableBody: HTMLElement;
  private addButton: HTMLElement | null;
  private sortButton: HTMLElement | null;

  private headerCells: NodeListOf<HTMLElement>;

  private static readonly FIELD_MAP: Record<number, SortField> = {
    1: 'name',
    2: 'email',
    3: 'phoneNum',
    4: 'enrollNum',
    5: 'dateAdmission',
  };

  /**
   * Init the StudentListView with the provided callbacks for handling add, edit, and delete actions.
   * @param onDelete - Callback function to handle deleting a student.
   * @param onEdit - Callback function to handle editing a student.
   * @param onAdd - Callback function to handle adding a new student.
   * @param onSortButtonClick - Callback function to handle sort button click (toggle order).
   * @param onSortFieldChange - Callback function to handle sort field change.
   */
  constructor(
    private onDelete: (id: string) => void,
    private onEdit: (id: string) => void,
    private onAdd: () => void,
    private onSortButtonClick: () => void,
    private onSortFieldChange: (field: SortField) => void,
  ) {
    this.tableBody = document.querySelector('.students__table tbody') as HTMLElement;
    this.addButton = document.querySelector('.students__add-btn');
    this.headerCells = document.querySelectorAll('.students__table-header');
    this.sortButton = document.querySelector('.students__sort-btn');

    this.attachEventListeners();
    this.initializeHeaderStyles();
  }

  private initializeHeaderStyles(): void {
    // Add sort-indicator spans to each sortable header
    this.headerCells.forEach((cell, index) => {
      // Skip first and last columns (image and actions)
      if (index === 0 || index === this.headerCells.length - 1) return;

      const cellText = cell.textContent;
      cell.innerHTML = `
        <div class="header-content">
          <span class="header-text">${cellText}</span>
        </div>
      `;
    });
  }

  /**
   * Attaches event listeners to the add and sort buttons.
   */
  private attachEventListeners(): void {
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.onAdd());
    }

    if (this.sortButton) {
      this.sortButton.addEventListener('click', () => this.onSortButtonClick());
    }

    // Add click handlers to sortable headers
    this.headerCells.forEach((cell, index) => {
      if (index === 0 || index === this.headerCells.length - 1) return;
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => this.handleHeaderClick(index));
    });
  }

  /**
   * Handle header click and delegate to controller
   * @param index - Index of the clicked header
   */
  private handleHeaderClick(index: number): void {
    const field = StudentListView.FIELD_MAP[index];
    if (!field) return;

    // Call controller to handle sort field change
    this.onSortFieldChange(field);
  }

  /**
   * Updates the UI to reflect the current sort configuration
   * @param sortConfig - Current sort configuration
   */
  public updateSortUI(sortConfig: SortConfig): void {
    this.updateHeaderStyles(sortConfig);
    this.updateSortButtonIcon(sortConfig.order);
  }

  /**
   * Updates header styles based on sort configuration
   * @param sortConfig - Current sort configuration
   */
  private updateHeaderStyles(sortConfig: SortConfig): void {
    this.headerCells.forEach((cell, index) => {
      // Remove active class from all headers
      cell.classList.remove('active-sort');

      // Add active class to currently sorted column
      if (StudentListView.FIELD_MAP[index] === sortConfig.field) {
        cell.classList.add('active-sort');
      }
    });
  }

  /**
   * Updates the sort button icon based on sort order
   * @param order - Current sort order
   */
  private updateSortButtonIcon(order: SortOrder): void {
    if (!this.sortButton) return;

    const sortImg = this.sortButton.querySelector('img');
    if (sortImg) {
      // Update the sort icon based on current sort order using imported assets
      sortImg.src = order === 'asc' ? sortUpIcon : sortDownIcon;
      sortImg.alt = order === 'asc' ? 'Sort ascending' : 'Sort descending';
    }
  }

  /**
   * Renders the list of students in the table body.
   * @param students - An array of students to render.
   *  @param preservePage - Whether to preserve current page after update (default: false)
   */

  /**
   * Renders the current page of students to the table
   * @param students - Students to display on current page
   */
  renderStudentTable(students: Student[]): void {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = '';

    if (students.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'students__table-row';
      emptyRow.innerHTML = `
        <td colspan="7" class="students__table-cell text-center">
          No students found. Click "ADD NEW STUDENT" to add one.
        </td>
      `;
      this.tableBody.appendChild(emptyRow);
      return;
    }

    students.forEach((student) => {
      const row = document.createElement('tr');
      row.className = 'students__table-row';
      if (student.id) {
        row.setAttribute('data-id', student.id);
      }

      row.innerHTML = studentRowTemplate(student);
      this.tableBody.appendChild(row);
    });

    // Attach event listeners to the new buttons
    this.attachRowEventListeners();
  }

  /**
   * Attaches event listeners to the edit and delete buttons in each row.
   */
  private attachRowEventListeners(): void {
    const editButtons = this.tableBody.querySelectorAll('.btn--edit');
    const deleteButtons = this.tableBody.querySelectorAll('.btn--delete');

    editButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          this.onEdit(id);
        }
      });
    });

    deleteButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          this.onDelete(id);
        }
      });
    });
  }
}
