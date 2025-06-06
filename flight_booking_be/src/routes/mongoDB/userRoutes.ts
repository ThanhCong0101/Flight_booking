import * as express from "express";

const router = express.Router();

import {
  getUserByID,
  getUserByField,
  createUser,
} from "../../controllers/mongoDB/userController";

router.get("/search", getUserByField);
router.post("/create", createUser);


router.get("/:id", getUserByID);

module.exports = router;
