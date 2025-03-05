import Student from '../interfaces/student';
import { studentRowTemplate } from '../templates/student-list';

import { SortField } from '../helpers/student-sort';

/**
 * Responsible for rendering the list of students and handling user interaction with the list
 */
export class StudentListView {
  private tableBody: HTMLElement;
  private addButton: HTMLElement | null;
  private sortDropdown: HTMLElement | null;

  /**
   * Init the StudentListView with the provided callbacks for handling add, edit, and delete actions.
   * @param onDelete - Callback function to handle deleting a student.
   * @param onEdit - Callback function to handle editing a student.
   * @param onAdd - Callback function to handle adding a new student.
   
   * @param onSortFieldChange - Callback function to handle sort field change.
   */
  constructor(
    private onDelete: (id: string) => void,
    private onEdit: (id: string) => void,
    private onAdd: () => void,
    private onSortFieldChange: (field: SortField) => void,
  ) {
    this.tableBody = document.querySelector('.students__table tbody') as HTMLElement;
    this.addButton = document.querySelector('.students__add-btn');
    this.sortDropdown = document.querySelector('.sort-dropdown');
    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to the add and sort buttons.
   */
  private attachEventListeners(): void {
    if (this.addButton) {
      this.addButton.addEventListener('click', () => this.onAdd());
    }

    if (this.sortDropdown) {
      this.sortDropdown.querySelectorAll('.sort-option').forEach((option) => {
        option.addEventListener('click', (e) => {
          const field = (e.currentTarget as HTMLElement).getAttribute('data-field') as SortField;
          if (field) {
            this.onSortFieldChange(field);
          }
        });
      });
    }
  }

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
