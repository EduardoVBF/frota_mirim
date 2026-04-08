export function toUTCISOString(date: string | Date) {
  return new Date(date).toISOString();
}