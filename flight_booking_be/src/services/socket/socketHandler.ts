const Connection = require("../../type/connection.type");
const ChatTopic = require("../../type/chatTopic.type");

const {
  JOIN_ROOM,
  ADD_MESSAGE,
  UPDATE_LAST_MESSAGE_ROOM,
  UPDATE_ROOM_STATUS,
  DELETE_ROOM_CHAT
} = require("./socketService");

import { convertMessageToMongoDBFormat } from "../../utils/messageUtils";
import { CONNECT_ROOM } from "./socketService";
let activeAdminSockets = new Map();

const handleSocket = (io, socket) => {
  console.log("A user connected", socket.id);

  let currentRoomId = null;
  let currentSocketRoomId = null;

  console.log("socket user", socket.user);
  if (socket.user) {
    if (socket.user[0]?.type === "admin") {
      activeAdminSockets.set(socket.id, {
        userId: socket.user.user_id,
        socket: socket,
      });
    }
  }

  socket.on(Connection.CONNECT_ROOM, async (data) => {
    await CONNECT_ROOM(socket, data);
  });

  socket.on(Connection.JOIN_ROOM, async (data) => {
    console.log("data JOIN_ROOM", data);

    await JOIN_ROOM(socket, data);
  });

  socket.on(Connection.CONNECT_ADMIN, handleConnectAdmin);

  // Add other event handlers here
  socket.on(Connection.NEW_MESSAGE, async (newData) => {
    console.log("newData", newData);
    const messageFormated = convertMessageToMongoDBFormat(newData);

    console.log("messageFormated", messageFormated);

    const newMessage = await ADD_MESSAGE(messageFormated);
    await UPDATE_LAST_MESSAGE_ROOM(
      messageFormated.room_id,
      messageFormated.content.data
    );

    // const socketsInRoom = await io.in(newData.socket_room_name).fetchSockets();

    // socketsInRoom.forEach((socket) => {

    //     if(socket.)
    //   socket.emit(Connection.RECEIVE_MESSAGE, newMessage);
    // });

    // console.log("socketsInRoom", socketsInRoom);

    socket.broadcast
      .to(newData.socket_room_name)
      .emit(Connection.RECEIVE_MESSAGE, newMessage);
  });

  socket.on(Connection.SUBSCRIBE_TO_CONVERSATION, async (data) => {
    const { room_id, socket_room_name, email } = data;

    console.log("subscribe to conversation", data);

    await JOIN_ROOM(socket, data);
    await UPDATE_ROOM_STATUS(room_id, "talk_with_admin_connected");

    io.in(socket_room_name).emit(Connection.RECEIVE_SUBCRIBE_CONVERSATION, {
      type: ChatTopic.RECEIVE_SUBCRIBE_CONVERSATION,
      data: {
        room_id: room_id,
        socket_room_name: socket_room_name,
        email: email,
      },
    });
  });

  socket.on(Connection.DISCONNECT_ADMIN, async (data) => {
    console.log("handleDisconnectAdmin", data);

    activeAdminSockets.delete(data.socket_room_name);

    await UPDATE_ROOM_STATUS(data.room_id, "talk_with_bot");

    io.in(data.socket_room_name).emit(Connection.DISCONNECT_ADMIN, {
      type: ChatTopic.ADMIN_DISCONNECTED,
      data: {
        user_id: data.user_id,
        room_id: data.room_id,
      },
    });
  });

  socket.on(Connection.END_CHAT, async (data) => {
    console.log("handleEndChat", data);

    const {socket_room_name,room_id} = data;

    socket.leave(socket_room_name);
    io.in(socket_room_name).socketsLeave(socket_room_name);

    await DELETE_ROOM_CHAT(room_id);

     // Notify other clients about chat end
     socket.broadcast.to(socket_room_name).emit(Connection.CHAT_ENDED, {
        message: "Chat has ended"
    });
  })
  // etc...
};

const handleConnectAdmin = async (data) => {
  activeAdminSockets.forEach((admin) => {
    admin.socket.emit(Connection.CONNECT_ADMIN, {
      type: ChatTopic.ADMIN_ASSIGNED,
      data: {
        user_id: data.user_id,
        room_id: data.room_id,
      },
    });
  });
  await UPDATE_ROOM_STATUS(data.room_id, "talk_with_admin_pending");
};

module.exports = {
  handleSocket,
  activeAdminSockets,
};
