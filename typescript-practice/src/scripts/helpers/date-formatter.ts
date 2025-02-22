export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}, ${year}`;
}

export function parseDate(dateString: string): Date {
  if (!dateString) return new Date();

  // Handle different date formats
  if (dateString.includes('-') && dateString.includes(',')) {
    // Format: "08-Dec, 2021"
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
