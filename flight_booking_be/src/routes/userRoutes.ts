import * as express from "express";

const router = express.Router();
const userController = require("../controllers/userController");

const { authMiddleware } = require("../middleware/authMiddleware");

const isAdmin = authMiddleware.isAdmin;

router.get("/search", userController.getUsers);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/search/users", userController.searchUserByEmailOrFullname);
router.get("/search/role", userController.searchUserByRole);
router.post("/", userController.createUser);
router.patch("/", userController.updateUserByEmail);
router.patch("/timezone", userController.updateUserTimezone);
router.patch("/update/role", userController.updateUserRole);
router.delete("/:id", userController.deleteUser);

// New route for searching users with multiple criteria

module.exports = router;
