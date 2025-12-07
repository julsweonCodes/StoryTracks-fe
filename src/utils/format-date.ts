/**
 * Formats an ISO 8601 OffsetDateTime string to "MMM DD, YYYY HH:mm" format
 * @param isoDateString - ISO 8601 formatted date string (e.g., "2025-09-20T00:00:00+09:00")
 * @returns Formatted date string (e.g., "Sep 20, 2025 00:00")
 */
export const formatLocalizedDateTime = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    // Format using Intl.DateTimeFormat for locale support
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);

    // Reconstruct the date string in the desired format: "MMM DD, YYYY HH:mm"
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    const minute = parts.find((p) => p.type === "minute")?.value;

    return `${month} ${day}, ${year} ${hour}:${minute}`;
  } catch {
    return "Invalid date";
  }
};
