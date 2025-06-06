import { Booking } from "../models/entity/Booking";

const verifyBookingMiddleware = async (req, res, next) => {
    const { bookingId, userId } = req.query;

    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
    }

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try{
        const booking = await Booking.createQueryBuilder("booking")
        .leftJoinAndSelect("booking.user", "user")
        .where("booking.booking_id = :bookingId", { bookingId })
        .andWhere("user.user_id = :userId", { userId })
        .getOne();

        if(booking === null) {
            return res.status(404).json({ message: "Booking not found" });
        }

        console.log("booking", booking);

        next();
    }catch(error) {
        res.status(404).json({ message: error.message });
    }

}

export { verifyBookingMiddleware };