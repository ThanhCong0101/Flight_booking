import { AppDataSource } from "../config/db";
import { User } from "../models/entity/User";
import {
  deleteUserFromMongo,
  syncUserToMongoJob,
} from "../queues/userSyncQueue";
import { delay } from "../utils/function";
import { sanitizeUser, sanitizeUserMongoDB } from "../utils/userUtils";

const userRepository = AppDataSource.getRepository(User);

const getAllUsers = async (page: number = 1, limit: number = 10) => {
  try {
    const [users, total] = await User.createQueryBuilder("user")
      .select([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.role",
        "user.timezone",
        "user.profile_picture",
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getUsersByFields = async (criteria: Record<string, string | number>) => {
  try {
    console.log("criteria", criteria);
    const users = await User.find({ where: criteria });
    if (users.length === 0) {
      return [];
    }
    return users;
  } catch (error) {
    return null;
  }
};

const getUserById = async (user_id: string | number) => {
  try {
    const user = await userRepository.findOne({
      where: { user_id: Number(user_id) },
    });
    return sanitizeUser(user);
  } catch (error) {
    console.error(`Error fetching user with id ${user_id}:`, error);
    throw error;
  }
};

const searchUserByEmailOrFullname = async (
  searchQuery: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const formattedQuery = searchQuery.replace(/-/g, " ");

    const [users, total] = await User.createQueryBuilder("user")
      .where("user.email LIKE :searchQuery", {
        searchQuery: `%${searchQuery}%`,
      })
      .orWhere("CONCAT(user.first_name, ' ', user.last_name) LIKE :fullName", {
        fullName: `%${formattedQuery}%`,
      })
      .select([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.role",
        "user.timezone",
        "user.profile_picture",
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    await delay(1000);

    return { users, total };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

const searchUserByRole = async (
  searchQuery: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const [users, total] = await User.createQueryBuilder("user")
      .select([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.role",
        "user.timezone",
        "user.profile_picture",
      ])
      .where("user.role = :roleQuery", {
        roleQuery: searchQuery,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    await delay(1000);
    return { users, total };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

const createUser = async (userDetail) => {
  try {
    const user = new User();
    Object.assign(user, userDetail);
    await user.save();

    console.log("userDetail", userDetail);

    await syncUserToMongoJob({ user_id: user.user_id, email: user.email });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const updateUser = async (id, userDetail) => {
  try {
    const user = await User.findOne({
      where: { user_id: id },
    });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    } else {
      Object.assign(user, userDetail);
      await user.save();
      return user;
    }
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

const updateUserByEmail = async (emailData, userDetail) => {
  try {
    const user = await User.findOne({
      where: { email: emailData },
    });

    if (!user) {
      throw new Error(`User with email ${emailData} not found`);
    }

    // Update specific fields from userDetail
    for (const [key, value] of Object.entries(userDetail)) {
      if (value !== undefined && value !== null) {
        user[key] = value;
      }
    }

    // Save to database
    const savedUser = await user.save();

    const mongoData = sanitizeUserMongoDB(savedUser);
    // Sync to MongoDB
    await syncUserToMongoJob(mongoData);

    return savedUser;
  } catch (error) {
    console.error(`Error updating user with email ${emailData}:`, error);
    throw error;
  }
};

const updateUserTimezone = async (user_id: string, timezone: string) => {
  try {
    const user = await User.findOne({
      where: { user_id: parseInt(user_id) },
    });

    if (!user) {
      throw new Error(`User with email ${user_id} not found`);
    }

    user.timezone = timezone;
    await user.save();

    return user;
  } catch (error) {
    console.error(`Error updating user with email ${user_id}:`, error);
    throw error;
  }
};

const updateUserRole = async (user_id: string, role: string) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const user = await queryRunner.manager.findOne(User, {
      where: { user_id: parseInt(user_id) },
    });

    if (!user) {
      throw new Error(`User with user_id ${user_id} not found`);
    }

    user.role = role;
    await queryRunner.manager.save(user);
    await queryRunner.commitTransaction();
    return user;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};
const deleteUser = async (user_id) => {
  try {
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      throw new Error(`User with user_id ${user_id} not found`);
    } else {
      await user.remove();

      await deleteUserFromMongo(user_id);

      return user;
    }
  } catch (error) {
    console.error(`Error deleting user with id ${user_id}:`, error);
    throw error;
  }
};

export {
  getAllUsers,
  getUserById,
  getUsersByFields,
  searchUserByEmailOrFullname,
  searchUserByRole,
  createUser,
  updateUser,
  updateUserByEmail,
  updateUserTimezone,
  updateUserRole,
  deleteUser,
};
