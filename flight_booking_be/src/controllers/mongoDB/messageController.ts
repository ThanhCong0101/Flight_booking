
const  MessageService = require("../../services/mongoDB/messageService");

const getMessageByID = async (req: any, res: any) => {
  try {
    const messageData = await MessageService.getMessageByID(req.params.room_id);
    res.status(200).json({
      message: "Message retrieved successfully",
      messageData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving message",
      error: error,
    });
  }
};
const getMessageByRoomID = async (req: any, res: any) => {
  try {
    const messages = await MessageService.getMessageByRoomID(
      req.params.room_id
    );
    res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving messages",
      error: error,
    });
  }
};


const createMessage = async (req: any, res: any) => {
  try {
    const messageData = {
      room_id: req.body.room_id,
      sender: req.body.sender,
      content: req.body.content,
      read_status: req.body.read_status
    };

    const message = await MessageService.createMessage(messageData);

    res.status(201).json({
      message: "Message created successfully",
      data: message
    });
  } catch (error) {
    console.log("Controller error:", error);
    res.status(500).json({
      message: "Error creating message",
      error: error.message
    });
  }
};


export { getMessageByID, getMessageByRoomID, createMessage };
