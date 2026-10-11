// Follow-up dates are calendar days stored as UTC midnight, not appointment times.
// Parse the date portion locally so the displayed day stays the one the user chose.
export function localFollowUpDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}
