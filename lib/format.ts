export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join("") || "?";
}

/** "OWNER" -> "Owner", "IN_PROGRESS" -> "In progress". */
export function formatEnumLabel(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "2 hours ago", "yesterday", "just now". */
export function formatRelativeTime(value: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000);
  const absolute = Math.abs(seconds);

  if (absolute < 45) return "just now";

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (absolute >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }

  return formatter.format(Math.round(seconds / 60), "minute");
}
