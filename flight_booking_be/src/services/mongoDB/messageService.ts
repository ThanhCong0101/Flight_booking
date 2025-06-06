import mongoose from "mongoose";
import { Message } from "../../models/models-mongodb/message.model";

const getMessageByID = async (id: string) => {
  try {
    const message = await Message.findById(id);
    return message;
  } catch (error) {
    console.log("get message by id error", error);
    throw error;
  }
};

const getMessageByRoomID = async (roomID: string) => {
  try {
    console.log("getMessageByRoomID roomID", roomID);
    const messages = await Message.find({
      room_id: new mongoose.Types.ObjectId(roomID),
    })
      .populate({
        path: "sender.user_id",
        model: "User",
        select:
          "user_id type first_name last_name email phone gender profile_picture",
        localField: "sender.user_id",
        foreignField: "user_id",
      })
      .populate({
        path: "read_status.read_by.user_id",
        model: "User",
        select:
          "user_id type first_name last_name email phone gender profile_picture",
        localField: "read_status.read_by.user_id",
        foreignField: "user_id",
      })

    return messages;
  } catch (error) {
    console.log("get message by room id error", error);
    throw error;
  }
};

const createMessage = async (messageData: any) => {
  try {
    const message = await Message.create(messageData);
    return message;
  } catch (error) {
    console.log("create new message error", error);
    throw error;
  }
};

module.exports = {
  getMessageByID,
  getMessageByRoomID,
  createMessage,
};
