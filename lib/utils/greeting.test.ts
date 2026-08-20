import { describe, it, expect } from "vitest";
import { getTimeOfDayGreeting, getUserFirstName } from "./greeting";

describe("greeting utility", () => {
  it("returns Good morning between 05:00 and 11:59", () => {
    const morningDate = new Date("2026-08-20T08:30:00");
    expect(getTimeOfDayGreeting(morningDate)).toBe("Good morning");
  });

  it("returns Good afternoon between 12:00 and 17:59", () => {
    const afternoonDate = new Date("2026-08-20T14:30:00");
    expect(getTimeOfDayGreeting(afternoonDate)).toBe("Good afternoon");
  });

  it("returns Good evening between 18:00 and 04:59", () => {
    const eveningDate = new Date("2026-08-20T20:30:00");
    expect(getTimeOfDayGreeting(eveningDate)).toBe("Good evening");
  });

  it("extracts first name from full name", () => {
    expect(getUserFirstName("Martins Adekunle")).toBe("Martins");
    expect(getUserFirstName("John Doe")).toBe("John");
    expect(getUserFirstName(null, "martins@example.com")).toBe("Martins");
  });
});
