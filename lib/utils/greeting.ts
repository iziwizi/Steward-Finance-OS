/**
 * Helper to compute time-of-day greeting and extract user display name
 */
export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function getUserFirstName(fullName?: string | null, email?: string | null): string {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/);
    return parts[0];
  }
  if (email && email.trim().length > 0) {
    const namePart = email.split("@")[0];
    // Capitalize first letter if it's a simple username
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  return "there";
}
