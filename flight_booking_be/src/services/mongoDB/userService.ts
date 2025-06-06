import mongoose from "mongoose";
import { User } from "../../models/models-mongodb/user.model";

const getUserByID = async (user_id: string) => {
  try {
    // const objectId = new mongoose.Types.ObjectId(user_id);

    // console.log("searchId", objectId);

    const user = await User.findOne({ user_id: user_id });

    return user;
  } catch (error) {
    console.error("Error get user:", error);
    throw error;
  }
};

const getUserByField = async (criteria: Record<string, string | number>) => {
  try {
    const user = await User.find(criteria)

    console.log("user get by field", user);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error get user by field:", error);
    throw error;
  }
};

const createUser = async (userData: any) => {
  try {
    let {
      user_id,
      type,
      first_name,
      last_name,
      email,
      phone,
      gender,
      is_temporary,
    } = userData;

    if (type === "guest" || type === "assistant") {
      first_name = null;
      last_name = null;
      email = null;
      phone = null;
      gender = null;
    }

    const user = await User.create({
      user_id,
      type,
      first_name,
      last_name,
      email,
      phone,
      gender,
      is_temporary,
    });

    user.save();

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

module.exports = {
  getUserByID,
  createUser,
  getUserByField,
};
