import { formatDate, parseDate } from '../helpers/date-formatter';
import Student from '../interfaces/student';
import { studentFormTemplate } from '../templates/student-form';
// @ts-expect-error
import defaultAvatar from '../../assets/images/user-images/user-profile.png';

/**
 * @class StudentFormView
 * @description  manages student from interface including rendering, validation and event handling
 * @property {HTMLElement} formContainer - the main container element for the form
 * @property {boolean} isEditMode - identify if the form is in edit mode
 * @property {string | null} currentStudentId - id of student being edited, null for new student
 * @property {Record<string, HTMLElement>} formErrorElements -  cache of error message elements
 */
export class StudentFormView {
  private formContainer: HTMLElement;
  private isEditMode = false;
  private currentStudentId: string | null = null;
  private formErrorElements: Record<string, HTMLElement> = {};

  /**
   * @constructor
   * @param {(studentData: Partial<Student>) => void} onSave -  callback function to handle form submission
   * @param {() => void} onCancel - callback function to handle form cancellation
   */
  constructor(
    private onSave: (studentData: Partial<Student>) => void,
    private onCancel: () => void,
  ) {
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'popup-container';
    this.formContainer.style.display = 'none';
    document.body.appendChild(this.formContainer);
  }

  /**
   * Handles action of rendering form
   * @param Student: optional student data for editing
   * @description renders the form with appropriate content to tailor the needs of adding or editing student
   */
  private renderForm(student?: Student): void {
    const formTitle = this.isEditMode ? 'Edit Student' : 'Add New Student';
    const submitButtonText = this.isEditMode ? 'Update Student' : 'Add Student';

    this.formContainer.innerHTML = studentFormTemplate(
      formTitle,
      student,
      submitButtonText,
      this.formatDateForInput.bind(this),
    );

    // Cache error elements for future updates
    const errorElements = this.formContainer.querySelectorAll('.error-message');
    errorElements.forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) {
        this.formErrorElements[field] = el as HTMLElement;
      }
    });

    this.attachFormEventListeners();
  }

  /**
   * Format dates string for input field
   * @param dataString: date string to format
   *
   */
  private formatDateForInput(dateString: string): string {
    const date = parseDate(dateString);
    return date.toISOString().split('T')[0];
  }

  /**
   *  Attach event listener to form elements including close, cancel, submit and upload
   */
  private attachFormEventListeners(): void {
    // Close button
    const closeBtn = this.formContainer.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.hide());

    // Cancel button
    const cancelBtn = this.formContainer.querySelector('.btn-cancel');
    cancelBtn?.addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });

    // Submit button
    const submitBtn = this.formContainer.querySelector('.btn-add');
    submitBtn?.addEventListener('click', () => this.handleSubmit());

    // Image upload
    const uploadBtn = this.formContainer.querySelector('.upload-btn');
    const fileInput = this.formContainer.querySelector('#avatarUpload') as HTMLInputElement;

    uploadBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const avatarImg = this.formContainer.querySelector('.profile-placeholder img');
          if (avatarImg) {
            avatarImg.setAttribute('src', result);
            avatarImg.setAttribute('class', 'student-avatar');
          }
        };
        reader.readAsDataURL(target.files[0]);
      }
    });
  }

  /**
   *  Collects and format form input values
   * @return {Partial<Student>} collect form data as a partial  student object
   */
  private getFormData(): Partial<Student> {
    const nameInput = this.formContainer.querySelector('#name') as HTMLInputElement;
    const emailInput = this.formContainer.querySelector('#email') as HTMLInputElement;
    const phoneInput = this.formContainer.querySelector('#phone') as HTMLInputElement;
    const enrollInput = this.formContainer.querySelector('#enroll') as HTMLInputElement;
    const admissionInput = this.formContainer.querySelector('#admission') as HTMLInputElement;
    const avatarImg = this.formContainer.querySelector('.student-avatar') as HTMLImageElement;

    // Format the date for display
    let formattedDate = '';
    if (admissionInput.value) {
      const date = new Date(admissionInput.value);
      formattedDate = formatDate(date);
    }

    const studentData: Partial<Student> = {
      name: nameInput.value,
      email: emailInput.value,
      phoneNum: phoneInput.value,
      enrollNum: enrollInput.value,
      dateAdmission: formattedDate,
      avatar: avatarImg?.src || `${defaultAvatar}'`,
    };

    if (this.currentStudentId) {
      studentData.id = this.currentStudentId;
    }

    return studentData;
  }

  /**
   * Handles form submission by collecting data and calling onSave callback function
   */
  private handleSubmit(): void {
    const studentData = this.getFormData();
    this.onSave(studentData);
  }

  /**
   * Displays validation errors on the form
   * @param {errors: Record<string, string>} errors - object containing field name and error messages
   */
  showErrors(errors: Record<string, string>): void {
    // Clear previous errors
    Object.values(this.formErrorElements).forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Reset all input borders
    const allInputs = this.formContainer.querySelectorAll('input');
    allInputs.forEach((input) => {
      input.classList.remove('is-invalid');
    });

    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      const errorEl = this.formErrorElements[field];
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';

        // Find and highlight the corresponding input
        let inputSelector = `#${field}`;
        // Special case for phoneNum field since the input id is 'phone'
        if (field === 'phoneNum') inputSelector = '#phone';
        // Special case for dateAdmission field since the input id is 'admission'
        if (field === 'dateAdmission') inputSelector = '#admission';
        if (field === 'enrollNum') inputSelector = '#enroll';
        const input = this.formContainer.querySelector(inputSelector) as HTMLInputElement;
        if (input) {
          input.classList.add('is-invalid');
          if (field === 'dateAdmission') {
            const calendarContainer = this.formContainer.querySelector('.calendar-input');
            if (calendarContainer) {
              calendarContainer.classList.add('is-invalid');
            }
          }
        }
      }
    });
  }

  /**
   * Displays add student form to create add new student
   *
   */
  showAddForm(): void {
    this.isEditMode = false;
    this.currentStudentId = null;
    this.renderForm();
    this.show();
  }

  /**
   * Display edit student form with existing student data
   * @param {Student} student - student data to populate edit form
   */
  showEditForm(student: Student): void {
    this.isEditMode = true;
    this.currentStudentId = student.id ?? null;
    this.renderForm(student);
    this.show();
  }

  /**
   * Show the form
   */
  show(): void {
    this.formContainer.style.display = 'block';
  }

  /**
   * Hide the form
   */
  hide(): void {
    this.formContainer.style.display = 'none';
  }
}
