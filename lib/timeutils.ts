// get sqlite timestamp for today's date
export function getTodayTimestamp(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// get sqlite timestamp for this hour
export function getThisHourTimestamp(): string {
  const today = new Date();
  return today.toISOString().split("T")[0] + " " + today.getHours() + ":00:00";
}

export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets the current date string (YYYY-MM-DD) for a given timezone.
 * @param {string} timezone - The timezone string (e.g., "America/New_York").
 * @returns {string} The current date string in YYYY-MM-DD format for the specified timezone.
 */
export function getDateForTimezone(timezone: string) {
  const now = new Date();

  // Use Intl.DateTimeFormat to format the date in the specified timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    // Using en-CA locale for YYYY-MM-DD format consistency
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  });

  // Format the date and split/rearrange to get YYYY-MM-DD
  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  // Ensure year, month, and day are found before returning
  if (!year || !month || !day) {
    // Handle the case where formatting fails or parts are missing
    console.error("Failed to format date parts for timezone:", timezone);
    // Fallback or throw an error as appropriate for your application
    return ""; // Or throw new Error("Could not format date");
  }

  return `${year}-${month}-${day}`;
}
