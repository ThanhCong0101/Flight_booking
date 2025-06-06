const chatService = require("../../services/mongoDB/chatService");

const GET_ROOM_CHAT_LIST = async (req: any, res: any) => {
  try {
    const { skip, limit } = req.query;
    const rooms = await chatService.GET_ROOM_CHAT_LIST(skip, limit);

    res.status(200).json({
      message: "Rooms retrieved successfully",
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rooms",
      error: error,
    });
  }
};

const GET_ROOM_CHAT_BY_STATUS = async (req: any, res: any) => {
    try {
      const { status,skip, limit } = req.query;
      const rooms = await chatService.GET_ROOM_CHAT_BY_STATUS(status,skip, limit);
  
      res.status(200).json({
        message: "Rooms retrieved successfully",
        rooms,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving rooms",
        error: error,
      });
    }
  };
export { GET_ROOM_CHAT_LIST, GET_ROOM_CHAT_BY_STATUS };
