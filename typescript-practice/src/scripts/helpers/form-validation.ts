import Student from '../interfaces/student';
import { ERROR_MESSAGES } from '../constants/form-validation-messages';

/**
 * Validator class provides static methods for validating student form fields.
 */
export class Validator {
  static readonly MAX_NAME_LENGTH: number = 50;
  static readonly MAX_EMAIL_LENGTH: number = 50;

  static validateEmail(email: string): boolean {
    if (email.length > this.MAX_EMAIL_LENGTH) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]{2,}){1,2}$/;
    return emailRegex.test(email);
  }

  /**
   * Validates a phone number.
   * @param phone - The phone number to validate.
   * @returns True if the phone number is valid, otherwise false.
   */
  static validatePhone(phone: string): boolean {
    // Remove all whitespace first
    const trimmedPhone = phone.replace(/\s+/g, '');
    // Check if it starts with an optional + and has 10-15 digits
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(trimmedPhone);
  }

  /**
   * Validates if a value is not empty.
   * @param value - The value to validate.
   * @returns True if the value is not empty, otherwise false.
   */
  static validateRequired(value: string): boolean {
    return !!value.trim();
  }

  /**
   * Validates an enrollment number.
   * @param enrollNum - The enrollment number to validate.
   * @returns True if the enrollment number is valid, otherwise false.
   */
  static validateEnrollmentNumber(enrollNum: string): boolean {
    const enrollRegex = /^[A-Z]{2}\d{7}$/;
    return enrollRegex.test(enrollNum);
  }

  /**
   * Validates a name.
   * @param name - The name to validate.
   * @returns True if the name is valid, otherwise false.
   */
  static validateName(name: string): boolean {
    if (name.length > this.MAX_NAME_LENGTH) return false;
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(name);
  }

  /**
   * Validates a date.
   * @param date - The date to validate.
   * @returns True if the date is valid and not in the future, otherwise false.
   */
  static validateDate(date: string): boolean {
    const inputDate = new Date(date);
    const today = new Date();
    return !isNaN(inputDate.getTime()) && inputDate <= today;
  }

  /**
   * Validates a student form.
   * @param student - The student data to validate.
   * @param existingStudents - An optional array of existing students to check for uniqueness.
   * @returns An object containing the validation result and any validation errors.
   */
  static validateForm(
    student: Partial<Student>,
    existingStudents: Student[] = [],
  ): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Name validation
    if (!this.validateRequired(student.name || '')) {
      errors.name = ERROR_MESSAGES.REQUIRED.NAME;
    } else if (!this.validateName(student.name || '')) {
      errors.name =
        (student.name?.length ?? 0) > this.MAX_NAME_LENGTH
          ? `Maximum ${this.MAX_NAME_LENGTH} characters allowed`
          : ERROR_MESSAGES.INVALID.NAME;
    }

    // Email validation
    if (!this.validateRequired(student.email || '')) {
      errors.email = ERROR_MESSAGES.REQUIRED.EMAIL;
    } else if (!this.validateEmail(student.email || '')) {
      errors.email =
        (student.email?.length ?? 0) > this.MAX_EMAIL_LENGTH
          ? `Maximum ${this.MAX_EMAIL_LENGTH} characters allowed.`
          : ERROR_MESSAGES.INVALID.EMAIL;
    }

    // Phone validation
    if (!this.validateRequired(student.phoneNum || '')) {
      errors.phoneNum = ERROR_MESSAGES.REQUIRED.PHONE;
    } else if (!this.validatePhone(student.phoneNum || '')) {
      errors.phoneNum = ERROR_MESSAGES.INVALID.PHONE;
    }

    // Enrollment number validation
    if (!this.validateRequired(student.enrollNum || '')) {
      errors.enrollNum = ERROR_MESSAGES.REQUIRED.ENROLL_NUM;
    } else if (!this.validateEnrollmentNumber(student.enrollNum || '')) {
      errors.enrollNum = ERROR_MESSAGES.INVALID.ENROLL_NUM;
    }

    // Date of admission validation
    if (!this.validateRequired(student.dateAdmission || '')) {
      errors.dateAdmission = ERROR_MESSAGES.REQUIRED.DATE_ADMISSION;
    } else if (!this.validateDate(student.dateAdmission || '')) {
      errors.dateAdmission = ERROR_MESSAGES.INVALID.DATE;
    }

    // Check for unique email
    if (!errors.email && student.email && existingStudents.length > 0) {
      if (!this.validateUniqueEmail(student.email, existingStudents, student.id)) {
        errors.email = ERROR_MESSAGES.DUPLICATE.EMAIL;
      }
    }

    // Check for unique enrollment number
    if (!errors.enrollNum && student.enrollNum && existingStudents.length > 0) {
      if (!this.validateUniqueEnrollmentNumber(student.enrollNum, existingStudents, student.id)) {
        errors.enrollNum = ERROR_MESSAGES.DUPLICATE.ENROLL_NUM;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validates if an email is unique among existing students.
   * @param email - The email to validate.
   * @param existingStudents - The array of existing students.
   * @param currentStudentId - The ID of the current student being validated
   * @returns True if the email is unique, otherwise false.
   */
  static validateUniqueEmail(
    email: string,
    existingStudents: Student[],
    currentStudentId?: string,
  ): boolean {
    return !existingStudents.some(
      (student) => student.email === email && student.id !== currentStudentId,
    );
  }

  /**
   * Validates if an enrollment number is unique among existing students.
   * @param enrollNum - The enrollment number to validate.
   * @param existingStudents - The array of existing students.
   * @param currentStudentId - The ID of the current student being validated
   * @returns True if the enrollment number is unique, otherwise false.
   */
  static validateUniqueEnrollmentNumber(
    enrollNum: string,
    existingStudents: Student[],
    currentStudentId?: string,
  ): boolean {
    return !existingStudents.some(
      (student) => student.enrollNum === enrollNum && student.id !== currentStudentId,
    );
  }
}
