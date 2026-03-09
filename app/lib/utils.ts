export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
