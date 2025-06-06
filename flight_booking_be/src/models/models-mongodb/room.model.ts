import mongoose from "mongoose";
import { User } from "./user.model";

const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    participants: [
      {
        user_id: {
          type: String,
          ref: "User",
          required: true,
          validate: {
            validator: async function (value) {
              const user = await User.findOne({ user_id: value });
              return user !== null;
            },
            message: "Referenced user_id does not exist",
          },
        },
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    last_message: {
      text: {
        type: String,
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: [
        "talk_with_admin_connected",
        "talk_with_admin_pending",
        "closed",
        "talk_with_bot",
      ],
      default: "talk_with_bot",
    },
    socket: {
      socket_room_name: {
        type: String,
        require: true,
        default: null,
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for faster queries on status and participants
RoomSchema.index({ status: 1 });
RoomSchema.index({ "participants.user_id": 1 });

const Room = mongoose.model("Room", RoomSchema);

export { Room };
