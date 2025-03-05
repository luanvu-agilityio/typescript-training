export const ERROR_MESSAGES = {
  //Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  //HTTP status code errors
  BAD_REQUEST: 'Bad request. Please check your input and try again.',
  UNAUTHORIZED: 'Unauthorized. Please login and try again.',
  FORBIDDEN: 'Forbidden. You do not have permission to access this resource.',
  NOT_FOUND: 'Not found. The requested resource does not exist.',
  INTERNAL_SERVER_ERROR: 'Internal server error. Please try again later.',
  // Generic errors
  DEFAULT_ERROR: 'An error occurred. Please try again later.',
  UNEXPECTED_ERROR: 'An unexpected error occurred.',
  //Data related errors
  NO_DATA: 'No data available.',
  DUPLICATE: 'Duplicate data. Please check your input and try again.',
  INVALID: 'Invalid data. Please check your input and try again.',

  // Operation-Specific Errors
  CREATE_STUDENT_ERROR: 'Failed to create student. Please try again.',
  UPDATE_STUDENT_ERROR: 'Failed to update student. Please try again.',
  DELETE_STUDENT_ERROR: 'Failed to delete student. Please try again.',
  FETCH_STUDENTS_ERROR: 'Failed to retrieve students. Please try again.',
};
