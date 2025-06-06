import { format, fromZonedTime, toZonedTime } from "date-fns-tz";

export const convertToLocationTimezone = (date: Date, userTimezone: string) => {
  const zonedDate = toZonedTime(date, userTimezone);
  return format(zonedDate, "yyyy-MM-dd HH:mm:ss", { timeZone: userTimezone });
};
