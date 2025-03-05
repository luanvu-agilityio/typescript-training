import { formatDate, parseDate } from '../helpers/date-formatter';
import IStudent from '../interfaces/student';
import { studentFormTemplate } from '../templates/student-form';
import { Validator } from '../helpers/form-validation';
import { ToastHandler } from '../helpers/toast-handler';
import { CloudinaryUploadService } from '../services/image-upload';
import { generateEnrollmentNumber } from '../helpers/enroll-number-generator';
// @ts-expect-error
import defaultAvatar from '../../assets/images/user-images/user-profile.png';

/**
 * @class StudentFormView
 * @description Manages student form interface including rendering, validation and event handling
 * @property {HTMLElement} formContainer - the main container element for the form
 * @property {boolean} isEditMode - identify if the form is in edit mode
 * @property {string | null} currentStudentId - id of student being edited, null for new student
 * @property {Record<string, HTMLElement>} formErrorElements - cache of error message elements
 */
export class StudentFormView {
  // ----------------------------
  // Class properties
  // ----------------------------
  private formContainer: HTMLElement;
  private isEditMode = false;
  private currentStudentId: string | null = null;
  private formErrorElements: Record<string, HTMLElement> = {};
  private isFormValid: boolean = true;

  /**
   * @constructor
   * @param {(studentData: Partial<Student>) => void} onSave - callback function to handle form submission
   * @param {() => void} onCancel - callback function to handle form cancellation
   * @param {() => Promise<Student[]>} getStudents - optional callback to fetch students for validation
   */
  constructor(
    private onSave: (studentData: Partial<IStudent>) => void,
    private onCancel: () => void,
    private getStudents?: () => Promise<IStudent[]>,
  ) {
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'popup-container';
    this.formContainer.style.display = 'none';
    document.body.appendChild(this.formContainer);
  }

  // ----------------------------
  // Public API methods
  // ----------------------------

  /**
   * Displays add student form to create a new student
   */
  showAddForm(): void {
    this.isEditMode = false;
    this.currentStudentId = null;
    this.formErrorElements = {};
    this.renderForm();
    this.show();

    this.getEnrollmentNumber();
  }

  /**
   * Display edit student form with existing student data
   * @param {Student} student - student data to populate edit form
   */
  showEditForm(student: IStudent): void {
    this.isEditMode = true;
    this.currentStudentId = student.id ?? null;
    this.formErrorElements = {};
    this.renderForm(student);
    this.show();
  }

  /**
   * Displays validation errors on the form
   * @param {Record<string, string>} errors - object containing field name and error messages
   */
  showErrors(errors: Record<string, string>): void {
    // Clear all previous errors first
    this.clearAllErrors();

    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      if (field !== 'enrollNum') {
        this.updateSingleFieldError(field, message);
      }
    });

    // Update submit button state
    this.updateSubmitButtonState();
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

  // ----------------------------
  // Form rendering methods
  // ----------------------------

  /**
   * Handles action of rendering form
   * @param {Student} student - optional student data for editing
   * @description renders the form with appropriate content to tailor the needs of adding or editing student
   */
  private renderForm(student?: IStudent): void {
    const formTitle = this.isEditMode ? 'Edit Student' : 'Add New Student';
    const submitButtonText = this.isEditMode ? 'Update Student' : 'Add Student';

    // Clear previous form content and state
    this.formContainer.innerHTML = '';
    this.formErrorElements = {};

    this.formContainer.innerHTML = studentFormTemplate(
      formTitle,
      student,
      submitButtonText,
      this.formatDateForInput.bind(this),
    );

    this.cacheErrorElements();
    this.populateFormFields(student);
    this.attachFormEventListeners();
    this.attachValidationListeners();

    const enrollInput = this.formContainer.querySelector('#enroll') as HTMLInputElement;
    if (enrollInput) {
      enrollInput.disabled = true;
      enrollInput.classList.add('disabled-input');
    }
  }

  /**
   * Generate a unique enrollment number
   */
  private async getEnrollmentNumber(): Promise<void> {
    const enrollInput = this.formContainer.querySelector('#enroll') as HTMLInputElement;
    if (!enrollInput) return;

    try {
      const students = await this.getAllStudentsAsync();

      const enrollNum = generateEnrollmentNumber(students);

      // Set the value of the input
      enrollInput.value = enrollNum;

      // Clear any existing error for enrollment number
      this.clearFieldError('enrollNum');
    } catch (error) {
      console.error('Failed to generate enrollment number:', error);
    }
  }

  /**
   * Cache error elements for future updates
   */
  private cacheErrorElements(): void {
    const errorElements = this.formContainer.querySelectorAll('.error-message');
    errorElements.forEach((el) => {
      const field = el.getAttribute('data-field');
      if (field) {
        this.formErrorElements[field] = el as HTMLElement;
      }
    });
  }

  /**
   * Populate form fields with student data if provided
   * @param {Student} student - optional student data
   */
  private populateFormFields(student?: IStudent): void {
    if (!student) return;

    const nameInput = this.formContainer.querySelector('#name') as HTMLInputElement;
    const emailInput = this.formContainer.querySelector('#email') as HTMLInputElement;
    const phoneInput = this.formContainer.querySelector('#phone') as HTMLInputElement;
    const enrollInput = this.formContainer.querySelector('#enroll') as HTMLInputElement;
    const admissionInput = this.formContainer.querySelector('#admission') as HTMLInputElement;
    const avatarImg = this.formContainer.querySelector(
      '.profile-placeholder img',
    ) as HTMLImageElement;

    if (nameInput) nameInput.value = student.name || '';
    if (emailInput) emailInput.value = student.email || '';
    if (phoneInput) phoneInput.value = student.phoneNum || '';
    if (enrollInput) enrollInput.value = student.enrollNum || '';

    // Handle date field with proper formatting
    if (admissionInput && student.dateAdmission) {
      admissionInput.value = this.formatDateForInput(student.dateAdmission);
    }

    // Ensure avatar is updated
    if (avatarImg && student.avatar) {
      avatarImg.src = student.avatar;
      avatarImg.classList.add('student-avatar');
    }
  }

  /**
   * Updates the submit button state based on visible errors
   */
  private updateSubmitButtonState(): void {
    const submitBtn = this.formContainer.querySelector('.btn-add') as HTMLButtonElement;
    if (!submitBtn) return;

    // Check if any error message is currently displayed
    const hasVisibleErrors = Object.values(this.formErrorElements).some(
      (el) => el.style.display === 'block' && el.textContent !== '',
    );

    // Only disable the button if there are visible errors
    if (hasVisibleErrors) {
      submitBtn.setAttribute('disabled', 'disabled');
      submitBtn.classList.add('disabled');
    } else {
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('disabled');
    }
  }

  // ----------------------------
  // Event handling methods
  // ----------------------------

  /**
   * Attach event listener to form elements including close, cancel, submit and upload
   */
  private attachFormEventListeners(): void {
    this.attachCloseButtonListener();
    this.attachCancelButtonListener();
    this.attachSubmitButtonListener();
    this.attachImageUploadListeners();
  }

  /**
   * Attach close button listener
   */
  private attachCloseButtonListener(): void {
    const closeBtn = this.formContainer.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.hide());
  }

  /**
   * Attach cancel button listener
   */
  private attachCancelButtonListener(): void {
    const cancelBtn = this.formContainer.querySelector('.btn-cancel');
    cancelBtn?.addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });
  }

  /**
   * Attach submit button listener
   */
  private attachSubmitButtonListener(): void {
    const submitBtn = this.formContainer.querySelector('.btn-add');
    submitBtn?.addEventListener('click', () => this.handleSubmit());
  }

  /**
   * Attach image upload listeners
   */
  private attachImageUploadListeners(): void {
    const uploadBtn = this.formContainer.querySelector('.upload-btn');
    const fileInput = this.formContainer.querySelector('#avatarUpload') as HTMLInputElement;
    const avatarImg = this.formContainer.querySelector('.profile-placeholder img');
    const uploadStatus = this.formContainer.querySelector('.upload-status');

    uploadBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        try {
          // Show loading state
          if (avatarImg) {
            avatarImg.classList.add('loading');
            uploadStatus?.classList.remove('hidden');
          }

          // Upload to Cloudinary
          const uploadedImageUrl = await CloudinaryUploadService.uploadAvatar(target.files[0]);

          if (avatarImg) {
            // Set the image preview to the uploaded image
            avatarImg.setAttribute('src', uploadedImageUrl);
            avatarImg.setAttribute('class', 'student-avatar');
          }
        } catch (error) {
          // Handle upload error
          console.error('Avatar upload failed:', error);

          // Show error message
          if (uploadStatus) {
            uploadStatus.textContent = error instanceof Error ? error.message : 'Upload failed';
            uploadStatus.classList.add('error');
          }

          // Show error toast
          ToastHandler.show(
            'error',
            'Upload Failed',
            error instanceof Error ? error.message : 'Could not upload avatar',
          );
        } finally {
          // Remove loading indicator
          if (avatarImg) {
            avatarImg.classList.remove('loading');
          }
        }
      }
    });
  }

  /**
   * Handles form submission by collecting data and calling onSave callback function
   */
  private handleSubmit(): void {
    const studentData = this.getFormData();
    this.onSave(studentData);
  }

  // ----------------------------
  // Form data methods
  // ----------------------------

  /**
   * Collects and format form input values
   * @return {Partial<Student>} collect form data as a partial student object
   */
  private getFormData(): Partial<IStudent> {
    const avatarImg = this.formContainer.querySelector('.student-avatar') as HTMLImageElement;
    const nameInput = this.formContainer.querySelector('#name') as HTMLInputElement;
    const emailInput = this.formContainer.querySelector('#email') as HTMLInputElement;
    const phoneInput = this.formContainer.querySelector('#phone') as HTMLInputElement;
    const enrollInput = this.formContainer.querySelector('#enroll') as HTMLInputElement;
    const admissionInput = this.formContainer.querySelector('#admission') as HTMLInputElement;

    // Format the date for display
    let formattedDate = '';
    if (admissionInput.value) {
      const date = new Date(admissionInput.value);
      formattedDate = formatDate(date);
    }

    const studentData: Partial<IStudent> = {
      name: nameInput.value,
      email: emailInput.value,
      phoneNum: phoneInput.value,
      enrollNum: enrollInput.value,
      dateAdmission: formattedDate,
      avatar: avatarImg?.src || `${defaultAvatar}`,
    };

    if (this.currentStudentId) {
      studentData.id = this.currentStudentId;
    }

    return studentData;
  }

  /**
   * Format dates string for input field
   * @param {string} dateString - date string to format
   * @return {string} formatted date string
   */
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = parseDate(dateString);
    // Make sure date is valid before formatting
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ----------------------------
  // Validation methods
  // ----------------------------

  /**
   * Attaches input event listeners for real-time validation
   */
  private attachValidationListeners(): void {
    const inputs = this.formContainer.querySelectorAll('input');

    inputs.forEach((input) => {
      // Skip file input
      if (input.type === 'file') return;

      let timeoutId: number;

      // Debounced validation for typing
      input.addEventListener('keyup', (e) => {
        const target = e.target as HTMLInputElement;

        // Clear previous timeout
        clearTimeout(timeoutId);

        // Set new timeout (debounce)
        timeoutId = window.setTimeout(() => {
          this.validateSingleInput(target);
        }, 2000); // 2 seconds delay
      });

      // Immediate validation on blur
      input.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        this.validateSingleInput(target);
      });

      // Special handling for date input (calendar)
      if (input.id === 'admission') {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          this.validateSingleInput(target);
        });
      }
    });
    this.validateAllFields();
  }

  /**
   * Validates all form fields at once
   */
  private validateAllFields(): void {
    const inputs = this.formContainer.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    let hasErrors = false;

    inputs.forEach((input) => {
      if (input.type === 'file') return;

      if (input.value.trim() === '') {
        // If a required field is empty, show Error
        const id = input.id;
        const fieldMap: Record<string, string> = {
          name: 'name',
          email: 'email',
          phone: 'phoneNum',
          admission: 'dateAdmission',
        };

        const field = fieldMap[id];
        if (field) {
          hasErrors = true;
        }
      }
    });

    // Update button state based on initial validation
    this.updateSubmitButtonState();
  }

  /**
   * Validates a single input and updates error state
   * @param {HTMLInputElement} input - input element to validate
   */
  private validateSingleInput(input: HTMLInputElement): void {
    const value = input.value;
    const id = input.id;

    // Map input IDs to student properties
    const fieldMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'phoneNum',
      admission: 'dateAdmission',
    };

    const field = fieldMap[id];
    if (!field) return;

    // Create partial student object with just this field
    const partialStudent: Partial<IStudent> = {};
    partialStudent[field as keyof IStudent] = value;

    // Add the current student ID if in edit mode
    if (this.isEditMode && this.currentStudentId) {
      partialStudent.id = this.currentStudentId;
    }

    // For email and enrollment, check for duplicates
    if (field === 'email') {
      // Get all students asynchronously and perform validation
      this.checkDuplicateField(field, value, partialStudent);
      return;
    }

    // Use existing validator but only for this specific field
    const { errors } = Validator.validateForm(partialStudent);

    if (!errors[field]) {
      // Field is valid, clear error for this field only
      this.clearFieldError(field);
    } else {
      // Field is invalid, update only this field's error
      this.updateSingleFieldError(field, errors[field]);
    }
    this.updateSubmitButtonState();
  }

  /**
   * Check for duplicate fields like email or enrollment number
   * @param {string} field - field name to check
   * @param {string} value - field value to check
   * @param {Partial<Student>} partialStudent - partial student object
   */
  private checkDuplicateField(
    field: string,
    value: string,
    partialStudent: Partial<IStudent>,
  ): void {
    this.getAllStudentsAsync().then((allStudents) => {
      const { errors } = Validator.validateForm(partialStudent, allStudents);

      if (!errors[field]) {
        // Field is valid, clear error for this field only
        this.clearFieldError(field);
      } else {
        // Field is invalid, update only this field's error
        this.updateSingleFieldError(field, errors[field]);
      }
    });
  }

  /**
   * Get all students for validation
   * @return {Promise<Student[]>} promise that resolves to array of students
   */
  private getAllStudentsAsync(): Promise<IStudent[]> {
    return new Promise<IStudent[]>((resolve) => {
      if (this.getStudents) {
        this.getStudents()
          .then((students) => {
            resolve(students);
          })
          .catch(() => {
            // In case of error, resolve with empty array to avoid validation issues
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }

  // ----------------------------
  // Error handling methods
  // ----------------------------

  /**
   * Clear all errors from the form
   */
  private clearAllErrors(): void {
    // Clear all error messages
    Object.values(this.formErrorElements).forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Reset all input borders
    const allInputs = this.formContainer.querySelectorAll('input');
    allInputs.forEach((input) => {
      input.classList.remove('is-invalid');
    });

    // Also reset calendar container if it exists
    const calendarContainer = this.formContainer.querySelector('.calendar-input');
    if (calendarContainer) {
      calendarContainer.classList.remove('is-invalid');
    }

    // Update submit button state
    this.updateSubmitButtonState();
  }

  /**
   * Updates error for a specific field without affecting other fields
   * @param {string} field - field name
   * @param {string} errorMessage - error message to display
   */
  private updateSingleFieldError(field: string, errorMessage: string): void {
    if (field === 'enrollNum') return;
    const errorEl = this.formErrorElements[field];
    if (errorEl) {
      errorEl.textContent = errorMessage;
      errorEl.style.display = 'block';
    }

    // Find and highlight the corresponding input
    const inputSelector = this.getInputSelectorFromField(field);
    const input = this.formContainer.querySelector(inputSelector) as HTMLInputElement;

    if (input) {
      input.classList.add('is-invalid');

      // Special handling for date field
      if (field === 'dateAdmission' || inputSelector === '#admission') {
        const calendarContainer = this.formContainer.querySelector('.calendar-input');
        if (calendarContainer) {
          calendarContainer.classList.add('is-invalid');
        }
      }
    }
    // Update button state after showing the error
    this.updateSubmitButtonState();
  }

  /**
   * Clears error for a specific field
   * @param {string} field - field name
   */
  private clearFieldError(field: string): void {
    const errorEl = this.formErrorElements[field];
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    // Find input and remove error class
    const inputSelector = this.getInputSelectorFromField(field);
    const input = this.formContainer.querySelector(inputSelector) as HTMLInputElement;

    if (input) {
      input.classList.remove('is-invalid');

      // Special handling for date field
      if (field === 'dateAdmission') {
        const calendarContainer = this.formContainer.querySelector('.calendar-input');
        if (calendarContainer) {
          calendarContainer.classList.remove('is-invalid');
        }
      }
    }
    // Update button state after clearing the error
    this.updateSubmitButtonState();
  }

  /**
   * Maps field names to input selectors
   * @param {string} field - field name
   * @return {string} CSS selector for the input
   */
  private getInputSelectorFromField(field: string): string {
    // Map field names to input IDs
    switch (field) {
      case 'phoneNum':
        return '#phone';
      case 'dateAdmission':
        return '#admission';
      case 'enrollNum':
        return '#enroll';
      default:
        return `#${field}`;
    }
  }
}
