export function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function parseUTCDateAsLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatUpcomingTasksDate(dateStr: string, hourStr: string) {
  if (!dateStr) return '';

  // Prepare dates without mutating original Date objects
  const today = new Date();
  const todayZero = new Date(today);
  todayZero.setHours(0, 0, 0, 0);

  // If hourStr is missing, default to midnight so date parsing works
  const safeHour = hourStr ?? '00:00:00';
  const taskDate = new Date(`${dateStr}T${safeHour}`);
  const taskZero = new Date(taskDate);
  taskZero.setHours(0, 0, 0, 0);

  const diffTime = taskZero.getTime() - todayZero.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const hourFormatted = hourStr ? hourStr.slice(0, 5) : '';

  if (diffDays === 0) return hourFormatted ? `Hoje, ${hourFormatted}` : 'Hoje';
  if (diffDays === 1) return hourFormatted ? `Amanhã, ${hourFormatted}` : 'Amanhã';

  const day = String(taskDate.getDate()).padStart(2, '0');
  const month = String(taskDate.getMonth() + 1).padStart(2, '0');
  return hourFormatted ? `${day}/${month}, ${hourFormatted}` : `${day}/${month}`;
}