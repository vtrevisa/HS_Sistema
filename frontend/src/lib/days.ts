export function daysUntil(date: string) {
 const today = new Date()
 const target = new Date(date)

 const diff = target.getTime() - today.getTime()
 return Math.ceil(diff / (1000 * 60 * 60 * 24))
}