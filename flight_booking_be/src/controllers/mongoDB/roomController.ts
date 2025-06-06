const roomService = require("../../services/mongoDB/roomService");

const getRoomsByID = async (req: any, res: any) => {
  try {
    const room_id = req.params.id;
    const rooms = await roomService.getRoomsByID(room_id);
    res.status(200).json({
      message: "Rooms retrieved successfully",
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rooms",
      error: error.message,
    });
  }
};

const createRoom = async (req: any, res: any) => {
  try {
    const { status, name, participants,socket } = req.body;

    console.log("status",status) 
    console.log("name", name)
    console.log("participants", participants)
    console.log("socket", socket)

    const room = await roomService.createRoom({
      status,
      name,
      participants,
      socket
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {}
};

const addParticipant = async (req: any, res: any) => {
  try {
    const { room_id, participant_id } = req.body;

    const room = await roomService.addParticipant(room_id, participant_id);
    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  }
  catch (error) {
    res.status(500).json({
      message: "Error creating room",
      error: error,
    });
  }
}

export {getRoomsByID, createRoom, addParticipant };
