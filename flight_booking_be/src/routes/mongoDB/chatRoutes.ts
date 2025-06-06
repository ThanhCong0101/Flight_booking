import * as express from "express";
import { GET_ROOM_CHAT_BY_STATUS, GET_ROOM_CHAT_LIST } from "../../controllers/mongoDB/chatController";

const router = express.Router();

router.get("/talk-to-admin-room", GET_ROOM_CHAT_LIST);
router.get("/talk-to-admin-room-by-status", GET_ROOM_CHAT_BY_STATUS);

module.exports = router;
