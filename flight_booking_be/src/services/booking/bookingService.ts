import { Booking } from "../../models/entity/Booking";
const userService = require("../userServices");
const passengerService = require("../passengerService");

import * as flightItineraryService from "../flight/flightItineraryService";

import { checkItineraryExistAndReturn } from "../../utils/flightUtils";
import { User } from "../../models/entity/User";
import { addEmailInvoiceJob } from "../../queues/emailInvoiceQueue";
import { scheduleFlightReminder } from "../../queues/flightReminderQueue";
import { AppDataSource } from "../../config/db";
import {
  addBookingTimeoutJob,
  bookingTimeoutQueue,
} from "../../queues/bookingTimeoutQueue";
import { Brackets, MoreThan } from "typeorm";
import { Passenger } from "../../models/entity/Passenger";
import { FlightItinerary } from "../../models/entity/FlightItinerary";
import { Flight } from "../../models/entity/Flight";
import { pastBookingPrefetchQueue } from "../../queues/pastBookingPrefetchQueue";
import { upcomingBookingPrefetchQueue } from "../../queues/upcomingBookingPrefetchQueue";

const initRedis = require("../../config/redis");

const client = initRedis.getRedis();

const getAllBookings = async (page: number = 1, limit: number = 10) => {
  try {
    // If use itinerary, legs, segments need this query
    const [bookings, total] = await Booking.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoin("booking.user", "user")
      // .leftJoinAndSelect("booking.itinerary", "itinerary")
      // .leftJoinAndSelect("itinerary.legs", "legs")
      // .leftJoinAndSelect("legs.segments", "segments")
      .select([
        "booking",
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.profile_picture",
        "passengers",
        // "itinerary",
        // "legs",
        // "segments",
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bookings, total };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

const getBookingById = async (booking_id: string) => {
  try {
    const booking = await Booking.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("booking.user", "user")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
      ])
      .where("booking.booking_id = :booking_id", { booking_id })
      .getOne();

    return booking;
  } catch (error) {
    console.error(`Error fetching booking with id ${booking_id}:`, error);
    throw error;
  }
};

const getBookingByField = async (
  criteria: Record<string, string | number>,
  page: number = 1,
  limit: number = 10
) => {
  try {
    console.log("criteria booking", criteria);
    const search = criteria.search;
    const activeTab = criteria.activeTab;
    const specificDate = criteria.specificDate;
    const startDate = criteria.startDate;
    const endDate = criteria.endDate;
    const sortBy = criteria.sortBy;
    const sortOrder = criteria.sortOrder;

    let queryBuilder;
    queryBuilder = Booking.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("booking.user", "user")
      .leftJoin("segments.departureAirport", "departureAirport")
      .leftJoin("segments.arrivalAirport", "arrivalAirport")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
        "departureAirport.iata",
        "departureAirport.name",
        "arrivalAirport.iata",
        "arrivalAirport.name",
      ]);

    if (specificDate) {
      const date = new Date(specificDate);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      queryBuilder = queryBuilder.andWhere(
        "booking.booking_date BETWEEN :startDate AND :endDate",
        {
          startDate: startOfDay,
          endDate: endOfDay,
        }
      );
    }

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        "booking.booking_date BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        }
      );
    }

    if (criteria.search) {
      const formattedQuery = search.toString().replace(/-/g, " ");

      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("booking.booking_id = :booking_id", { booking_id: search })
            .orWhere(
              "CONCAT(user.first_name, ' ', user.last_name) LIKE :fullName",
              {
                fullName: `%${formattedQuery}%`,
              }
            )
            .orWhere("user.last_name = :last_name", { last_name: search });
        })
      );
    }

    if (activeTab == "upcoming") {
      console.log("activeTab", activeTab);
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("booking.status = :approved_booking", {
            approved_booking: "approved",
          }).orWhere("booking.status = :pending_booking", {
            pending_booking: "pending",
          });
        })
      );
    } else if (activeTab == "past") {
      queryBuilder = queryBuilder.andWhere(
        "booking.status = :complete_booking",
        {
          complete_booking: "complete",
        }
      );
    }

    if (sortBy && sortOrder) {
      queryBuilder = queryBuilder.orderBy(`booking.${sortBy}`, sortOrder);
    }

    const [bookings, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bookings, total };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

const getUpcomingBookings = async (
  user_id: number,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const redisClient = client.instanceConnect;
    const ttl_booking = 60 * 5; // Cache for 5 minutes

    const timestamp =
      Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000);
    const cacheKey = `upcoming-bookings:${timestamp}:${page}`;

    console.log("cacheKey", cacheKey);

    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    let queryBuilder = Booking.createQueryBuilder("booking");

    queryBuilder = queryBuilder
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("booking.user", "user")
      .leftJoin("segments.departureAirport", "departureAirport")
      .leftJoin("segments.arrivalAirport", "arrivalAirport")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
        "departureAirport.iata",
        "departureAirport.name",
        "arrivalAirport.iata",
        "arrivalAirport.name",
      ])
      .where("booking.status = :approvedStatus", { approvedStatus: "approved" })
      .orWhere("booking.status = :pendingStatus", {
        pendingStatus: "pending",
      });

    if (user_id) {
      queryBuilder = queryBuilder.andWhere("booking.user_id = :user_id", {
        user_id,
      });
    }

    const [upcomingBookings, totalUpcoming] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Cache current page
    await redisClient.set(
      cacheKey,
      JSON.stringify({ bookings: upcomingBookings, total: totalUpcoming }),
      "EX",
      ttl_booking
    );

    console.log("total Upcoming Service: ", totalUpcoming);
    // Prefetch next 2 pages
    if (totalUpcoming >= page * limit) {
      const pagesToPrefetch = Math.min(
        2,
        Math.round((totalUpcoming - page * limit) / limit)
      );

      console.log("pagesToPrefetch", pagesToPrefetch);

      for (let i = 1; i <= pagesToPrefetch; i++) {
        const nextPage = Number(page) + Number(i);
        await upcomingBookingPrefetchQueue.add(
          "prefetch-upcoming-booking-page",
          {
            user_id: user_id,
            page: nextPage,
            pageSize: limit,
            timestamp,
          }
        );
      }
    }

    return { bookings: upcomingBookings, total: totalUpcoming };
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    throw error;
  }
};

const getPastBookings = async (
  user_id: number,
  page: number = 1,
  limit: number = 10
) => {
  try {
    console.log("page Service", page);
    console.log("limit Service", limit);

    const redisClient = client.instanceConnect;
    const ttl_booking = 60 * 5; // Cache for 5 minutes

    const timestamp =
      Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000);
    const cacheKey = `past-bookings:${timestamp}:${page}`;

    console.log("cacheKey", cacheKey);

    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    let queryBuilder = Booking.createQueryBuilder("booking");

    queryBuilder = queryBuilder
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("booking.user", "user")
      .leftJoin("segments.departureAirport", "departureAirport")
      .leftJoin("segments.arrivalAirport", "arrivalAirport")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
        "departureAirport.iata",
        "departureAirport.name",
        "arrivalAirport.iata",
        "arrivalAirport.name",
      ])
      .where("booking.status = :completeStatus", {
        completeStatus: "complete",
      });

    if (user_id) {
      queryBuilder = queryBuilder.andWhere("booking.user_id = :user_id", {
        user_id,
      });
    }

    const [pastBookings, totalPast] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Cache current page
    await redisClient.set(
      cacheKey,
      JSON.stringify({ bookings: pastBookings, total: totalPast }),
      "EX",
      ttl_booking
    );

    console.log("total Past Service: ", totalPast);
    // Prefetch next 2 pages
    if (totalPast >= page * limit) {
      const pagesToPrefetch = Math.min(
        2,
        Math.round((totalPast - page * limit) / limit)
      );

      console.log("pagesToPrefetch", pagesToPrefetch);

      for (let i = 1; i <= pagesToPrefetch; i++) {
        const nextPage = Number(page) + Number(i);
        await pastBookingPrefetchQueue.add("prefetch-page", {
          user_id: user_id,
          page: nextPage,
          pageSize: limit,
          timestamp,
        });
      }
    }
    return { bookings: pastBookings, total: totalPast };
  } catch (error) {
    console.error("Error fetching past bookings:", error);
    throw error;
  }
};

const getBookingByUserId = async (user_id: string) => {
  try {
    console.log("user_id", user_id);

    const user = await userService.getUserById(user_id);

    if (!user) {
      throw new Error("User not found");
    }

    const bookings = await Booking.createQueryBuilder("booking")
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("segments.departureAirport", "departureAirport")
      .leftJoin("segments.arrivalAirport", "arrivalAirport")
      .leftJoin("booking.user", "user")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
        "departureAirport.iata",
        "departureAirport.name",
        "arrivalAirport.iata",
        "arrivalAirport.name",
      ])
      .where("booking.user_id = :user_id", { user_id })
      .getMany();

    console.log("bookings", bookings);
    return bookings;
  } catch (error) {
    console.error(`Error fetching booking with id ${user_id}:`, error);
    throw error;
  }
};

const checkAvailabilitySeat = async (
  itineraryId: string,
  token: string, 
  isCheckRedis: boolean = true
) => {
  const totalSeats = 100; // Configure based on aircraft capacity
  let valueFlightItinerary = null;

  const cacheKeyDB = `flight-detail-db:${itineraryId}`;

  console.log("isCheckRedis", isCheckRedis);
  if (isCheckRedis) {
    const redisClient = client.instanceConnect;

    valueFlightItinerary = JSON.parse(await redisClient.get(cacheKeyDB));
  }

  console.log("valueFlightItinerary 1", valueFlightItinerary);

  if (!valueFlightItinerary) {
    valueFlightItinerary = await FlightItinerary.findOne({
      where: { itinerary_id: itineraryId },
      relations: ["legs", "legs.segments"],
    });

    if (!valueFlightItinerary) {
      valueFlightItinerary = await checkItineraryExistAndReturn(itineraryId, token);
    }
  }

  console.log("valueFlightItinerary 2", valueFlightItinerary);

  const isAvailableSeat = valueFlightItinerary.legs.every((leg) => {
    const hasSeat = leg.segments.every((segment) => {
      return totalSeats - segment.capacity > 0;
    });
    return hasSeat;
  });

  return { isAvailableSeat: isAvailableSeat };
};

const addNewPassenger = async (booking_id: number) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const currentBooking = await queryRunner.manager.findOne(Booking, {
      where: { booking_id: booking_id },
      relations: {
        itinerary: {
          legs: {
            segments: true,
          },
        },
      },
    });

    if (!currentBooking) {
      throw new Error("Booking not found");
    }

    console.log("currentBooking", currentBooking);

    const availableSeat = await checkAvailabilitySeat(
      currentBooking.itinerary.itinerary_id,
      'abc',
      false
    );

    console.log("availableSeat", availableSeat);

    if (!availableSeat.isAvailableSeat) {
      return {
        status: false,
        message: "Seat not available",
      };
    } else {
      // Update capacity for all flight segments
      for (const leg of currentBooking.itinerary.legs) {
        for (const segment of leg.segments) {
          await queryRunner.manager.update(
            Flight,
            { flight_id: segment.flight_id },
            { capacity: () => `capacity + 1` }
          );
        }
      }

      await queryRunner.manager.update(
        Booking,
        { booking_id: booking_id },
        { noPassengers: currentBooking.noPassengers + 1 }
      );

      await queryRunner.commitTransaction();

      return {
        status: true,
        message: "Add new passenger successfully",
      };
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error adding new passenger:", error);
  } finally {
    await queryRunner.release();
  }
};

const bookingPending = async (booking_data: any, token: string) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  const { itinerary_id, user_id } = booking_data;

  // const cacheKeyRes = `flight-detail:${itinerary_id}`;
  const cacheKeyDB = `flight-detail-db:${itinerary_id}`;

  try {
    const availableSeat = await checkAvailabilitySeat(itinerary_id, token, false);

    if (!availableSeat.isAvailableSeat) {
      throw new Error("No available seat");
    }

    const redisClient = client.instanceConnect;

    let valueFlightItinerary = JSON.parse(await redisClient.get(cacheKeyDB));

    if (!valueFlightItinerary) {
      valueFlightItinerary = await FlightItinerary.findOne({
        where: { itinerary_id: itinerary_id },
        relations: ["legs", "legs.segments"],
      });
      if (!valueFlightItinerary) {
        throw new Error("Itinerary not found");
      }
    }

    // Check user is exist
    // const user = await userService.getUserById(user_id);
    const user = await User.createQueryBuilder("user")
      .select([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
      ])
      .where("user.user_id = :userID", { userID: user_id })
      .getOne();

    if (valueFlightItinerary && user) {
      const lastBooking = await queryRunner.manager.findOne(Booking, {
        where: { user: { user_id: user.user_id }, status: "pending" },
      });

      if (!lastBooking) {
        const booking = await queryRunner.manager.save(Booking, {
          booking_date: new Date(),
          status: "pending",
          total_price: valueFlightItinerary.formatted_price,
          user: user,
          itinerary: valueFlightItinerary,
        });

        for (const leg of valueFlightItinerary.legs) {
          for (const segment of leg.segments) {
            await queryRunner.manager.update(
              Flight,
              { flight_id: segment.flight_id },
              { capacity: () => `capacity + 1` }
            );
          }
        }

        await addBookingTimeoutJob(booking.booking_id.toString());

        await queryRunner.commitTransaction();

        return booking;
      }

      return lastBooking;
    } else {
      throw new Error("Flight not found or User not found");
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(`Error fetching booking with id ${itinerary_id}:`, error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const createBooking = async (bookingDetail) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { itinerary_id, user_id, booking_id, passenger_data } = bookingDetail;

    const bookingPending = await Booking.findOne({
      where: { booking_id: booking_id, status: "pending" },
    });

    if (!bookingPending) {
      throw new Error("Booking not found");
    }

    // Check user is exist
    const user = await User.findOne({ where: { user_id: user_id } });

    if (!user) {
      throw new Error("User not found");
    }

    // Check flight is exist
    let flightItinerary = await flightItineraryService.getFlightItineraryById(
      itinerary_id
    );

    if (!flightItinerary) {
      throw new Error("Flight not found");
    }

    await queryRunner.manager.update(
      Booking,
      { booking_id: booking_id },
      {
        booking_date: new Date(),
        status: "approved",
      }
    );

    const booking = await Booking.createQueryBuilder("booking")
      .leftJoin("booking.user", "user")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
      ])
      .where("booking.booking_id = :booking_id", { booking_id })
      .getOne();

    const passengers = await Promise.all(
      passenger_data.map(async (passengerData) => {
        const newPassenger = await queryRunner.manager.save(Passenger, {
          ...passengerData,
          user: { user_id: user.user_id },
          booking: { booking_id: booking.booking_id },
        });
        console.log("newPassenger", newPassenger);
        return newPassenger;
      })
    );

    await queryRunner.commitTransaction();

    await addEmailInvoiceJob(booking, flightItinerary);
    await scheduleFlightReminder(booking, flightItinerary, user);

    const pendingBookingJob = await bookingTimeoutQueue.getJob(
      `booking-timeout-${booking.booking_id.toString()}`
    );

    if (pendingBookingJob) {
      await pendingBookingJob.remove();
      console.log("Delete pending booking job");
    }

    return {
      booking: booking,
      passenger: passengers,
      itinerary: flightItinerary,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateBooking = async (booking_id, bookingDetail) => {
  try {
    const booking = await Booking.findOne({
      where: { booking_id },
      relations: ["passengers"],
    });

    if (!booking) {
      throw new Error(`Booking with id ${booking_id} not found`);
    }
    Object.assign(booking, bookingDetail);

    if (bookingDetail.passengers) {
      await Promise.all(
        bookingDetail.passengers.map(async (passengerData) => {
          const passenger = passengerService.getPassengerById(
            passengerData.passenger_id
          );
          if (passenger) {
            console.log("passenger", passenger);
            await passengerService.updatePassenger(
              passenger.passenger_id,
              passengerData
            );
          }
        })
      );
    }

    await booking.save();
    return booking;
  } catch (error) {
    console.error(`Error updating booking with id ${booking_id}:`, error);
    throw error;
  }
};

const deleteBooking = async (booking_id) => {
  try {
    const booking = await Booking.findOne({
      where: { booking_id },
    });
    if (!booking) {
      throw new Error(`Booking with id ${booking_id} not found`);
    } else {
      await booking.remove();
      return {
        status: true,
        message: "Booking deleted successfully",
      };
    }
  } catch (error) {
    console.error(`Error deleting booking with id ${booking_id}:`, error);
    throw error;
  }
};

const deleteBookingPending = async (bookingID) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const booking = await Booking.findOne({
      where: {
        booking_id: bookingID,
        status: "pending",
      },
      relations: {
        itinerary: {
          legs: {
            segments: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking with id ${bookingID} not found`);
    }

    // Restore seats for each flight segment
    for (const leg of booking.itinerary.legs) {
      for (const segment of leg.segments) {
        await queryRunner.manager.update(
          Flight,
          { flight_id: segment.flight_id },
          { capacity: () => `capacity - ${booking.noPassengers}` }
        );
      }
    }

    await queryRunner.manager.delete(Booking, { booking_id: bookingID });
    await queryRunner.commitTransaction();

    return {
      status: true,
      message: "Booking deleted successfully and flight capacities restored",
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(`Error deleting booking with id ${bookingID}:`, error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const deletePassengerPendingBooking = async (bookingID) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const currentBooking = await Booking.findOne({
      where: {
        booking_id: bookingID,
        status: "pending",
      },
      relations: {
        itinerary: {
          legs: {
            segments: true,
          },
        },
      },
    });
    if (!currentBooking) {
      throw new Error(`Booking with id ${bookingID} not found`);
    }

    console.log("currentBooking", currentBooking);

    // Restore seats for each flight segment
    for (const leg of currentBooking.itinerary.legs) {
      for (const segment of leg.segments) {
        await queryRunner.manager.update(
          Flight,
          { flight_id: segment.flight_id },
          { capacity: () => `capacity - 1` }
        );
      }
    }

    await queryRunner.manager.update(
      Booking,
      { booking_id: bookingID },
      { noPassengers: currentBooking.noPassengers - 1 }
    );

    await queryRunner.commitTransaction();
  } catch (error) {
    console.error(`Error deleting booking with id ${bookingID}:`, error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingByField,
  getUpcomingBookings,
  getPastBookings,
  getBookingByUserId,
  checkAvailabilitySeat,
  addNewPassenger,
  bookingPending,
  createBooking,
  updateBooking,
  deleteBooking,
  deleteBookingPending,
  deletePassengerPendingBooking,
};
