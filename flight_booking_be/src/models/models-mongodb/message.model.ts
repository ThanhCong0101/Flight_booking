// const mongoose = require("mongoose");
import mongoose from "mongoose";
import { User } from "./user.model";
import { Room } from "./room.model";

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    room_id: {
      type: String,
      ref: "Room",
      required: true,
      validate: {
        validator: async function (value) {
          const room = await Room.findOne({ _id: value });
          return room !== null;
        },
        message: "Referenced room_id does not exist",
      },
    },
    sender: {
      user_id: {
        type: String,
        ref: "User",
        required: true,
        validate: {
          validator: async function (value) {
            const user = await User.findOne({
              $or: [
                { user_id: value },
                ...(mongoose.Types.ObjectId.isValid(value)
                  ? [{ _id: value }]
                  : []),
              ],
            });
            return user !== null;
          },
          message: "Referenced user_id does not exist",
        },
      },
      type: {
        type: String,
        enum: ["user", "admin", "guest", "assistant"],
        required: true,
      },
    },
    content: {
      type: {
        type: String,
        enum: [
          "text",
          "voice",
          "image",
          "carousel",
          "cardV2",
          "choice",
          "formField",
        ],
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
    read_status: {
      is_read: {
        type: Boolean,
        default: false,
      },
      read_by: [
        {
          user_id: {
            type: String,
            ref: "User",
            required: true,
            validate: {
              validator: async function (value) {
                const user = await User.findOne({
                  $or: [
                    { user_id: value },
                    ...(mongoose.Types.ObjectId.isValid(value)
                      ? [{ _id: value }]
                      : []),
                  ],
                });
                return user !== null;
              },
              message: "Referenced user_id does not exist",
            },
          },
        },
      ],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Message = mongoose.model("Message", MessageSchema);

export { Message };
