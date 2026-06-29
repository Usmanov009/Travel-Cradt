/** Earliest selectable trip start date (tomorrow — today and past blocked). */
export function getMinBookableDateString(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return toDateInputValue(d);
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isDateBookable(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr >= getMinBookableDateString();
}

export function bookingDateError(dateStr: string): string | null {
  if (!dateStr) return "Sana tanlang";
  if (!isDateBookable(dateStr)) {
    return "Bugun va o'tgan kunlar tanlanmaydi. Ertadan boshlang.";
  }
  return null;
}
