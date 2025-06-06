import { Booking } from "../models/entity/Booking";
import { Passenger } from "../models/entity/Passenger";

// const getAllPassengers = async () => {
//   try {
//     const passengers = await Passenger.find();
//     return passengers;
//   } catch (error) {
//     console.error("Error fetching passengers:", error);
//     throw error;
//   }
// };

const getAllPassengers = async (page: number = 1, limit: number = 10) => {
  try {
    const [passengers, total] = await Passenger.createQueryBuilder("passenger")
      .leftJoin("passenger.user", "user")
      .leftJoin("passenger.booking", "booking")
      // .leftJoinAndSelect("passenger.booking", "booking")
      // .leftJoinAndSelect("passenger.user", "user")
      .addSelect([
        "booking.booking_id",
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { passengers, total };
  } catch (error) {
    console.error("Error fetching passengers:", error);
    throw error;
  }
};

const getPassengerById = async (passenger_id) => {
  try {
    const passenger = await Passenger.findOne({ where: { passenger_id } });
    return passenger;
  } catch (error) {
    console.error(`Error fetching passenger with id ${passenger_id}:`, error);
    throw error;
  }
};

const getPassengersByFields = async (
  criteria: Record<string, string | number>
) => {
  try {
    console.log("criteria Service", criteria);
    let queryBuilder = Passenger.createQueryBuilder("passenger");

    if (criteria.user_id) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect("passenger.user", "user")
        .where("user.user_id = :userId", { userId: criteria.user_id });
    }

    const passengers = await queryBuilder.getMany();

    console.log("passengers", passengers);

    if (passengers.length === 0) {
      return [];
    }
    return passengers;
  } catch (error) {
    console.error("Error fetching passengers:", error);
    throw error;
  }
};

const getRecentPassengersByUserId = async (
  userId: number,
  limit: number = 3
) => {
  try {
    const passengers = await Passenger.createQueryBuilder("passenger")
      .leftJoinAndSelect("passenger.user", "user")
      .where("user.user_id = :userId", { userId })
      .orderBy("passenger.passenger_id", "DESC")
      .take(limit)
      .getMany();

    return passengers;
  } catch (error) {
    console.error("Error fetching recent passengers:", error);
    throw error;
  }
};

const createPassenger = async (passengerDetail) => {
  try {
    // Get the booking entity first
    const booking = await Booking.findOne({
      where: { booking_id: passengerDetail.booking_id },
    });

    if (!booking) {
      throw new Error(
        `Booking with id ${passengerDetail.booking_id} not found`
      );
    }

    const passenger = Passenger.create({
      first_name: passengerDetail.first_name,
      last_name: passengerDetail.last_name,
      gender: passengerDetail.gender,
      passport_number: passengerDetail.passport_number,
      passport_expiry: passengerDetail.passport_expiry,
      nationality: passengerDetail.nationality,
      date_of_birth: passengerDetail.date_of_birth,
      street_address: passengerDetail.street_address,
      city: passengerDetail.city,
      country: passengerDetail.country,
      postal_code: passengerDetail.postal_code,
      booking: { booking_id: passengerDetail.booking_id },
      user: { user_id: passengerDetail.user_id },
    });

    await passenger.save();
    return passenger;
  } catch (error) {
    console.error("Error creating passenger:", error);
    throw error;
  }
};

const updatePassenger = async (passenger_id, passengerDetail) => {
  try {
    const passenger = await Passenger.findOne({
      where: { passenger_id },
    });
    if (!passenger) {
      throw new Error(`Passenger with id ${passenger_id} not found`);
    }
    Object.assign(passenger, passengerDetail);
    await passenger.save();
    return passenger;
  } catch (error) {
    console.error(`Error updating passenger with id ${passenger_id}:`, error);
    throw error;
  }
};

const deletePassenger = async (passenger_id) => {
  try {
    const passenger = await Passenger.findOne({ where: { passenger_id } });
    if (!passenger) {
      throw new Error(`Passenger with id ${passenger_id} not found`);
    }
    await passenger.remove();
    return passenger;
  } catch (error) {
    console.error(`Error deleting passenger with id ${passenger_id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  getPassengersByFields,
  getRecentPassengersByUserId,
  createPassenger,
  updatePassenger,
  deletePassenger,
};
