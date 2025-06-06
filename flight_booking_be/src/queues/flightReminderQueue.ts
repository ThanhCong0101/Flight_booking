import { User } from "../models/entity/User";
import { sendFlightReminder } from "../utils/emailService";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { Queue } from "bullmq";

import { redisConfig } from "../config/redis";

export const flightReminderQueue = new Queue("flight-reminders", {
  connection: redisConfig,
});

// Schedule reminder when booking is created
export const scheduleFlightReminder = async (
  booking,
  itinerary,
  user: User
) => {
  const flight = itinerary.legs[0].departure_time; // First leg departure

  const userTimezone = user.timezone || "UTC";

  // Convert flight time to user's timezone and subtract reminder hours
  console.log("flight Time before: ", flight);
  console.log("userTimezone: ", userTimezone);
  const flightTime = toZonedTime(flight, userTimezone);

  //   console.log("flightTime after: ", flightTime);
  const flightTimeFormated = format(flightTime, "yyyy-MM-dd HH:mm:ss", {
    timeZone: userTimezone,
  } as any);
  console.log("flightTime after: ", flightTimeFormated);

  const reminder3HoursTime = new Date(
    flightTime.getTime() - 3 * 60 * 60 * 1000
  ); // 3 hours before flight

  const reminder1DayTime = new Date(flightTime.getTime() - 24 * 60 * 60 * 1000); // 1 Day before flight

  // Schedule the reminder
  await flightReminderQueue.add(
    "send-reminder-3-hours",
    { booking, user, itinerary },
    {
      delay: reminder3HoursTime.getTime() - Date.now(),
      attempts: 3,
    }
  );

  // Schedule the reminder
  await flightReminderQueue.add(
    "send-reminder-1-day",
    { booking, user, itinerary },
    {
      delay: reminder1DayTime.getTime() - Date.now(),
      attempts: 3,
    }
  );
};
