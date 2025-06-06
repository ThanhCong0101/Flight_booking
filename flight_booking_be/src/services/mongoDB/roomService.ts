import { Room } from "../../models/models-mongodb/room.model";
import { User } from "../../models/models-mongodb/user.model";

const getRoomsByID = async (room_id: string) => {
  try {
    // const room = await Room.findById(room_id);

    const room = await Room.findOne({ _id: room_id }).populate({
      path: "participants.user_id",
      model: "User",
      select: "type first_name last_name email phone gender profile_picture",
      localField: "participants.user_id",
      foreignField: "user_id",
    });

    return room;
  } catch (error) {
    console.error("Error retrieving room:", error);
    throw error;
  }
};

const createRoom = async (room_data) => {
  const { status, name, participants, socket } = room_data;
  try {

    const newRoom = await Room.create({
      status,
      name,
      participants,
      socket,
    });

    newRoom.save();

    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

const addParticipant = async (room_id: string, identifier: string) => {
  try {
    const room = await Room.findById(room_id);
    if (!room) {
      throw new Error(`Room with ID ${room_id} not found`);
    }

    const user = await User.findOne({
      $or: [{ user_id: identifier }, { email: identifier }],
    });

    if (!user) {
      throw new Error(`User with identifier ${identifier}  not found`);
    }

    room.participants.push({ user_id: user.user_id });
    await room.save();
    return room;
  } catch (error) {
    console.error("Error adding participant to room:", error);
    throw error;
  }
};

const updateRoom = async (room_id, updateData) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(room_id, updateData, {
      new: true,
    });
    return updatedRoom;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

const updateLastMessage = async (room_id, lastMessage) => {};

module.exports = {
  getRoomsByID,
  createRoom,
  addParticipant,
  updateRoom,
  updateLastMessage,
};
