import * as express from "express";

const router = express.Router();

import {
  createRoom,
  getRoomsByID,
  addParticipant
} from "../../controllers/mongoDB/roomController";

router.get("/:id", getRoomsByID);
router.post("/create", createRoom);
router.post("/add-participant", addParticipant);

module.exports = router;
