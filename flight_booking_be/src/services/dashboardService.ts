import { MoreThan } from "typeorm";
import { Booking } from "../models/entity/Booking";
import { Flight } from "../models/entity/Flight";
import { FlightItinerary } from "../models/entity/FlightItinerary";

const getDashboardMetrics = async () => {
  try {
    const totalBookings = await Booking.count();

    const revenue = await Booking.createQueryBuilder("booking")
      .where("booking.status = :status", { status: "complete" })
      .select("SUM(CAST(booking.total_price AS DECIMAL))", "total")
      .getRawOne();

    const availableFlights = await Flight.count({
      where: { capacity: MoreThan(0) },
    });

    return {
      totalBookings,
      revenue: revenue.total || 0,
      availableFlights,
    };
  } catch (error) {
    throw error;
  }
};

const getDashboardTrends = async () => {
  try {
    const bookingTrends = await Booking.createQueryBuilder("booking")
      .select("DATE_FORMAT(booking.booking_date, '%Y-%m-01')", "month")
      .addSelect("COUNT(*)", "count")
      .where("booking.booking_date > :startDate", {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)),
      })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    const revenueTrends = await Booking.createQueryBuilder("booking")
    .select("DATE_FORMAT(booking.booking_date, '%Y-%m-01')", "month")
      .addSelect("SUM(CAST(booking.total_price AS DECIMAL))", "revenue")
      .where("booking.status = :status", { status: "complete" })
      .andWhere("booking.booking_date > :startDate", {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)),
      })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    return { bookingTrends, revenueTrends };
  } catch (error) {
    throw error;
  }
};

const getPopularDestinations = async () => {
  try {
    const destinations = await FlightItinerary.createQueryBuilder("itinerary")
      .leftJoin("itinerary.bookings", "booking")
      .leftJoin("itinerary.legs", "legs")
      .leftJoin("legs.segments", "segments")
      .leftJoin("segments.arrivalAirport", "airport")
      .select("airport.name", "destination")
      .addSelect("COUNT(*)", "count")
      .where("booking.status = :status", { status: "complete" })
      .groupBy("airport.name")
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany();

    return destinations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getDashboardMetrics,
  getDashboardTrends,
  getPopularDestinations,
};
