export function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function parseUTCDateAsLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatUpcomingTasksDate(dateStr: string, hourStr: string) {
  const today = new Date();
  const taskDate = new Date(`${dateStr}T${hourStr}`);
  
  const diffTime = taskDate.setHours(0,0,0,0) - today.setHours(0,0,0,0);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const hourFormatted = hourStr.slice(0, 5); // Pega HH:MM

  if (diffDays === 0) return `Hoje, ${hourFormatted}`;
  if (diffDays === 1) return `Amanhã, ${hourFormatted}`;

  const day = String(taskDate.getDate()).padStart(2, "0");
  const month = String(taskDate.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}, ${hourFormatted}`;
}