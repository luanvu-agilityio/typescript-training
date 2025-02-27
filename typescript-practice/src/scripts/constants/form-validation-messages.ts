export const ERROR_MESSAGES = {
  REQUIRED: {
    NAME: 'Name is required',
    EMAIL: 'Email is required',
    PHONE: 'Phone number is required',
    ENROLL_NUM: 'Enrollment number is required',
    DATE_ADMISSION: 'Date of admission is required',
    DATE_BIRTH: 'Date of birth is required',
  },
  INVALID: {
    NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes.',
    EMAIL: 'Invalid email format.',
    PHONE:
      'Please enter a valid phone number in format xxxx xxx xxx (10-15 digits, optional + for country code).',
    ENROLL_NUM: 'Invalid enrollment number format (should be like EN2023001)',
    DATE: 'Invalid date or date is in the future',
    DATE_BIRTH: 'Invalid date of birth',
  },
  AGE: 'Student must be at least 16 years old',
  ADDRESS_LENGTH: 'Address must be at least 10 characters long',
  DUPLICATE: {
    EMAIL: 'This email is already registered in the system',
    ENROLL_NUM: 'This enrollment number is already in use',
  },
};
