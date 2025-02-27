/**
 * Formats a Date object into a string in the format "DD-MMM, YYYY".
 * @param date - The Date object to format.
 * @returns A formatted date string.
 */
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}, ${year}`;
}

/**
 * Parses a date string into a Date object.
 * Supports the format "DD-MMM, YYYY".
 * Falls back to the browser's date parsing for other formats.
 * @param dateString - The date string to parse.
 * @returns A Date object.
 */
export function parseDate(dateString: string): Date {
  if (!dateString) return new Date();

  // Handle different date formats
  if (dateString.includes('-') && dateString.includes(',')) {
    // Format to: "08-Dec, 2021"
    const [dayMonth, year] = dateString.split(', ');
    const [day, month] = dayMonth.split('-');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthIndex = monthNames.findIndex((m) => m === month);
    return new Date(parseInt(year), monthIndex, parseInt(day));
  }

  // Default to browser's date parsing
  return new Date(dateString);
}
