const mongoose = require("mongoose");

const Connection = require("../../type/connection.type");
import { Message } from "../../models/models-mongodb/message.model";
import { Room } from "../../models/models-mongodb/room.model";
import { User } from "../../models/models-mongodb/user.model";
const roomService = require("../mongoDB/roomService");

const ADD_MESSAGE = async (data) => {
  try {
    console.log("data.sender.user_id", data.sender.user_id);
    // Find user by string user_id, not ObjectId
    const senderExists = await User.findOne({
      $or: [
        { user_id: data.sender.user_id.user_id },
        { user_id: data.sender.user_id },
        ...(mongoose.Types.ObjectId.isValid(data.sender.user_id)
          ? [{ _id: data.sender.user_id._id }]
          : []),
      ],
    });

    console.log("data.read_status.read_by", data.read_status.read_by);

    const readByUsersExist = await Promise.all(
      data.read_status.read_by.map(async (reader) => {
        return await User.findOne({
          $or: [
            { user_id: reader.user_id.user_id },
            { user_id: reader.user_id },

            ...(mongoose.Types.ObjectId.isValid(reader.user_id)
              ? [{ _id: reader.user_id._id }]
              : []),
          ],
        });
      })
    );

    if (!senderExists) {
      throw new Error(`Sender with user_id ${data.sender.user_id} not found`);
    }

    if (readByUsersExist.includes(null)) {
      throw new Error("One or more read_by users do not exist");
    }

    const newMessage = await new Message({
      room_id: data.room_id,
      sender: data.sender,
      content: data.content,
      read_status: data.read_status,
    }).save();

    return Message.populate(newMessage, {
      path: "sender.user_id",
      model: "User",
      select: "type first_name last_name email phone gender profile_picture",
      localField: "sender.user_id",
      foreignField: "user_id",
    });
  } catch (error) {
    console.log("Error when add new message on database", error);
    throw error;
  }
};

const GET_MESSAGES = async (data) => {
  try {
    return await Message.find({ room: data.room._id }).populate({
      path: "participants.user_id",
      model: "User",
      select: "type first_name last_name email phone gender profile_picture",
    });
  } catch (error) {
    console.log("Error when get message on database", error);
  }
};

const CONNECT_ROOM = async (socket, data) => {
  const { socket_room_name } = data;
  await socket.join(socket_room_name);
};

const JOIN_ROOM = async (socket, data) => {
  const { socket_room_name, room_id, email } = data;
  await socket.join(socket_room_name);

  console.log("join room", data);
  socket.to(socket_room_name).emit(Connection.NEW_MESSAGE, "hello");

  await roomService.addParticipant(room_id, email);
};

const UPDATE_LAST_MESSAGE_ROOM = async (room_id: string, last_message: any) => {
  try {
    const room = await roomService.getRoomsByID(room_id);

    if (room) {
      room.last_message.text = last_message;
      room.last_message.timestamp = new Date();
      room.save();
      console.log("room", room);
    }
  } catch (error) {
    console.log("error", error);
  }
};

const UPDATE_ROOM_STATUS = async (
  room_id: string,
  status:
    | "talk_with_admin_connected"
    | "talk_with_admin_pending"
    | "closed"
    | "talk_with_bot"
) => {
  try {
    const room = await Room.findOne({ _id: room_id });
    if (room) {
      room.status = status;
      room.save();
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

// const UPDATE_ROOM_USERS = async (data) => {
//   const room = await Room.findOne({ name: data.room.name })
//     .select("-password")
//     .populate("users", []);

//   if (room) {
//     if (
//       room.participants &&
//       !room.participants.find(
//         (user) => user.user_id.toString() === data.user_id
//       )
//     ) {
//       room.participants.push({
//         lookup: mongoose.Types.ObjectId(data.user._id),
//         socketId: data.socketId,
//       });
//       const updatedRoom = await room.save();
//       return await Room.populate(updatedRoom, {
//         path: "user users.lookup",
//         select: "username social image handle",
//       });
//     } else {
//       // Update user socket id if the user already exists
//       const existingUser = room.participants.find(
//         (user) => user.user_id.toString() === data.user._id
//       );
//       // if (existingUser.socketId != data.socketId) {
//       //     existingUser.socketId = data.socketId;
//       //     await room.save();
//       // }
//       return await Room.populate(room, {
//         path: "user users.lookup",
//         select: "username social image handle",
//       });
//     }
//   } else {
//     return;
//   }
// };

const FILTER_ROOM_USERS = async () => {};

const DELETE_ROOM_CHAT = async (room_id: string) => {
  try {
    // Delete all messages in the room
    await Message.deleteMany({ room_id: room_id });

    // Delete the room
    await Room.findByIdAndDelete(room_id);

    return {
      success: true,
      message: "Room and messages deleted successfully",
    };
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export {
  ADD_MESSAGE,
  CONNECT_ROOM,
  JOIN_ROOM,
  GET_MESSAGES,
  UPDATE_LAST_MESSAGE_ROOM,
  UPDATE_ROOM_STATUS,
  DELETE_ROOM_CHAT,
};

// module.exports = {
//     ADD_MESSAGE: async data => {
//         const newMessage = await new Message({
//             content: data.content,
//             admin: data.admin ? true : false,
//             user: data.user ? data.user._id : null,
//             room: data.room._id
//         }).save();

//         return Message.populate(newMessage, {
//             path: 'user',
//             select: 'username social handle image'
//         });
//     },
//     GET_MESSAGES: async data => {
//         return await Message.find({ room: data.room._id }).populate('user', [
//             'username',
//             'social',
//             'handle',
//             'image'
//         ]);
//     },
//     CREATE_MESSAGE_CONTENT: (room, socketId) => {
//         const user = room.previous.users.find(user => user.socketId === socketId);

//         return user && user.lookup.handle
//             ? `${user.lookup.handle} has left ${room.updated.name}`
//             : `Unknown User has left ${room.updated.name}`;
//     },
//     GET_ROOMS: async () => {
//         return await Room.find({})
//             .populate('user users.lookup', ['username', 'social', 'handle', 'image'])
//             .select('-password');
//     },
//     GET_ROOM_USERS: async data => {
//         return await Room.findById(data.room._id)
//             .populate('user users.lookup', ['username', 'social', 'handle', 'image'])
//             .select('-password');
//     },
//     UPDATE_ROOM_USERS: async data => {
//         const room = await Room.findOne({ name: data.room.name })
//             .select('-password')
//             .populate('users.lookup', ['username', 'social', 'handle', 'image']);

//         if (room) {
//             if (
//                 room.users &&
//                 !room.users.find(user => user.lookup._id.toString() === data.user._id)
//             ) {
//                 room.users.push({
//                     lookup: mongoose.Types.ObjectId(data.user._id),
//                     socketId: data.socketId
//                 });
//                 const updatedRoom = await room.save();
//                 return await Room.populate(updatedRoom, {
//                     path: 'user users.lookup',
//                     select: 'username social image handle'
//                 });
//             } else {
//                 // Update user socket id if the user already exists
//                 const existingUser = room.users.find(
//                     user => user.lookup._id.toString() === data.user._id
//                 );
//                 if (existingUser.socketId != data.socketId) {
//                     existingUser.socketId = data.socketId;
//                     await room.save();
//                 }
//                 return await Room.populate(room, {
//                     path: 'user users.lookup',
//                     select: 'username social image handle'
//                 });
//             }
//         } else {
//             return;
//         }
//     },
//     FILTER_ROOM_USERS: async data => {
//         const room = await Room.findById(mongoose.Types.ObjectId(data.roomId))
//             .select('-password')
//             .populate('users.lookup', ['username', 'social', 'handle', 'image']);
//         if (room) {
//             let previousUserState = Object.assign({}, room._doc);
//             room.users = room.users.filter(user => user.socketId !== data.socketId);
//             const updatedRoom = await room.save();
//             return {
//                 previous: previousUserState,
//                 updated: await Room.populate(updatedRoom, {
//                     path: 'user users.lookup',
//                     select: 'username social image handle'
//                 })
//             };
//         }
//     }
// };
