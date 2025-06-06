import * as express from "express";

const router = express.Router();

import {
  getMessageByID,
  getMessageByRoomID,
  createMessage,
} from "../../controllers/mongoDB/messageController";

router.get("/room/:room_id", getMessageByRoomID);
router.post("/create", createMessage);

router.get("/:id", getMessageByID);
module.exports = router;
