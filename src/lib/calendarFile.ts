// A one-event calendar file (.ics) the browser downloads, so an event lands
// in whatever calendar the student uses (Google, Apple, Outlook). Moved
// here from the United Way board (12 Oct 2026) so its shifts and Connect's
// event page share one implementation.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** month: a month name or its first three letters; time: "6:30 PM" */
export function downloadCalendarFile(title: string, date: { year: number; month: string; day: number; time?: string }, where: string, hours = 1) {
  const m = /(\d+):(\d+)\s*(AM|PM)/.exec(date.time ?? "");
  const h = m ? (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0) : 9;
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${date.year}${pad(MONTHS.indexOf(date.month.slice(0, 3)) + 1)}${pad(date.day)}`;
  const stamp = (hh: number) => `${day}T${pad(Math.min(23, hh))}${m ? m[2] : "00"}00`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dreamari//Connect//EN", "BEGIN:VEVENT", `UID:${day}-${title.replace(/\W+/g, "-")}@dreamari`, `DTSTART:${stamp(h)}`, `DTEND:${stamp(h + Math.max(1, Math.round(hours)))}`, `SUMMARY:${title}`, `LOCATION:${where}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/** "November 14, 2026" and "10:00 AM" as the parts the file needs; null
 *  when the date isn't a real one yet ("First event to be announced"). */
export function parseEventDate(date: string, time?: string): { year: number; month: string; day: number; time?: string } | null {
  const m = /([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(date);
  return m ? { month: m[1], day: Number(m[2]), year: Number(m[3]), time } : null;
}
