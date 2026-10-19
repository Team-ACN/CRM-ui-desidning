// Shared by CallbackCalendarAndTimePicker and every page that uses it to seed a default slot.
export const TIME_SLOTS = [
  { value: '10:00', label: '10 AM' },
  { value: '11:00', label: '11 AM' },
  { value: '12:00', label: '12 PM' },
  { value: '13:00', label: '1 PM' },
  { value: '14:00', label: '2 PM' },
  { value: '15:00', label: '3 PM' },
  { value: '16:00', label: '4 PM' },
  { value: '17:00', label: '5 PM' },
  { value: '18:00', label: '6 PM' },
  { value: '19:00', label: '7 PM' },
  { value: '20:00', label: '8 PM' },
];

// Picks a sensible default slot the first time "Call Back" is selected — clamped to business
// hours (10 AM–8 PM), rolling over to tomorrow 10 AM if it's currently past 8 PM.
export function toBusinessSlot(date) {
  const d = new Date(date);
  let h = d.getHours();
  if (h < 10) h = 10;
  if (h > 20) {
    d.setDate(d.getDate() + 1);
    h = 10;
  }
  const pad = (n) => String(n).padStart(2, '0');
  return {
    dateValue: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    timeValue: `${pad(h)}:00`,
  };
}
