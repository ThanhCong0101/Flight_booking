import { Room } from "../../models/models-mongodb/room.model";

const GET_ROOM_CHAT_LIST = async (skip: number = 0, limit: number = 10) => {
  try {
    const rooms = await Room.find({
      status: {
        $in: ["talk_with_admin_connected", "talk_with_admin_pending"],
      },
    })
      .populate({
        path: "participants.user_id",
        model: "User",
        select: "type first_name last_name email phone gender profile_picture",
        localField: "participants.user_id",
        foreignField: "user_id",
      })
      .skip(skip)
      .limit(limit);

    console.log("rooms talk to admin", rooms);
    return rooms;
  } catch (error) {
    console.error("Error fetching room chat list:", error);
    throw error;
  }
};

const GET_ROOM_CHAT_BY_STATUS = async (
  status:
    | "talk_with_admin_connected"
    | "talk_with_admin_pending"
    | "closed"
    | "talk_with_bot",
  skip: number = 0,
  limit: number = 10
) => {
  try {
    console.log("status", status);

    const rooms = await Room.find({
      status
    })
      .populate({
        path: "participants.user_id",
        model: "User",
        select: "type first_name last_name email phone gender profile_picture",
        localField: "participants.user_id",
        foreignField: "user_id",
      })
      .skip(skip)
      .limit(limit);

    console.log("rooms talk to admin by status", rooms);
    return rooms;
  } catch (error) {
    console.error("Error fetching room chat list:", error);
    throw error;
  }
};

module.exports = {
  GET_ROOM_CHAT_LIST,
  GET_ROOM_CHAT_BY_STATUS,
};
