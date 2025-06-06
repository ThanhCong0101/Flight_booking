import { sanitizeUser, sanitizeUserBasicInfo } from "../utils/userUtils";

const userService = require("../services/userServices");

const getAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const users = await userService.getAllUsers(page, limit);

    return res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const criteria = req.query;
    console.log(criteria);
    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ message: "No search criteria provided" });
    }

    const users = await userService.getUsersByFields(criteria);

    if (users.length === 0) {
      return res.status(204).json({ message: "No users found" });
    }

    const sanitizedUsers = users.map((user) => sanitizeUser(user));
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const searchUserByEmailOrFullname = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await userService.searchUserByEmailOrFullname(query);
    return res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchUserByRole = async (req, res) => {
  try {
    const role = req.query.role;
    if (!role) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await userService.searchUserByRole(role);
    return res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const user = await userService.updateUserByEmail(email, req.body);
    const sanitizedUsers = sanitizeUser(user);
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUserTimezone = async (req, res) => {
  try {
    const timezone = req.body.timezone;

    const user_id_from_accessToken = req.data.user_id;
    console.log(user_id_from_accessToken);
    const user = await userService.updateUserTimezone(
      user_id_from_accessToken,
      timezone
    );
    const sanitizedUsers = sanitizeUser(user);
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const role = req.query.role;
    const user = await userService.updateUserRole(user_id, role);
    const sanitizedUsers = sanitizeUserBasicInfo(user);
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUsers,
  getUserById,
  searchUserByEmailOrFullname,
  searchUserByRole,
  createUser,
  updateUserByEmail,
  updateUserTimezone,
  updateUserRole,
  deleteUser,
};
