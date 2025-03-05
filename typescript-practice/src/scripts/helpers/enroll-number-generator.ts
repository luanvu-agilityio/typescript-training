import IStudent from '../interfaces/student';

/**
 * Generates a unique enrollment number
 * @param {IStudent[]} students - Array of existing students to check for uniqueness
 * @returns {string} A unique enrollment number
 */
export function generateEnrollmentNumber(students: IStudent[]): string {
  let isUnique = false;
  let enrollNum = '';

  while (!isUnique) {
    // Generate 2 uppercase letters (A-Z)
    const letters = Array(2)
      .fill(0)
      .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      .join('');

    // Generate 7 digits
    const digits = Array(7)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('');

    enrollNum = `${letters}${digits}`;

    // Check if this number already exists
    isUnique = !students.some((student) => student.enrollNum === enrollNum);
  }

  return enrollNum;
}
