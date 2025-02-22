import Student from '../interfaces/student';
import { ERROR_MESSAGES } from '../constants/form-validation-messages';

export class Validator {
  static validateEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  }

  static validateRequired(value: string): boolean {
    return !!value.trim();
  }

  static validateEnrollmentNumber(enrollNum: string): boolean {
    const enrollRegex = /^[A-Z]{2}\d{7}$/;
    return enrollRegex.test(enrollNum);
  }

  static validateName(name: string): boolean {
    const nameRegex = /^[A-Za-z\s\-']+$/;
    return nameRegex.test(name);
  }

  static validateDate(date: string): boolean {
    const inputDate = new Date(date);
    const today = new Date();
    return !isNaN(inputDate.getTime()) && inputDate <= today;
  }

  static validateForm(student: Partial<Student>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Name validation
    if (!this.validateRequired(student.name || '')) {
      errors.name = ERROR_MESSAGES.REQUIRED.NAME;
    } else if (!this.validateName(student.name || '')) {
      errors.name = ERROR_MESSAGES.INVALID.NAME;
    }

    // Email validation
    if (!this.validateRequired(student.email || '')) {
      errors.email = ERROR_MESSAGES.REQUIRED.EMAIL;
    } else if (!this.validateEmail(student.email || '')) {
      errors.email = ERROR_MESSAGES.INVALID.EMAIL;
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

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
