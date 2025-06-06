import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    // _id: {
    //   type: Schema.Types.ObjectId,
    //   required: true, // Unique identifier for all users (admin/user/guest/assistant)
    // },
    user_id: {
      type: String,
      require: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["admin", "user", "guest", "assistant"], // Allowed user types
    },
    first_name: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      default: null,
    },
    last_name: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      default: null,
    },
    email: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      default: null,
      validate: {
        validator: function (v) {
          if (this.type === "guest" || this.type === "assistant") return true;
          return /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      default: null,
      validate: {
        validator: function (v) {
          if (this.type === "guest" || this.type === "assistant") return true;
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
      },
    },
    gender: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      enum: ["male", "female", "other", null],
      default: null,
    },
    profile_picture: {
      type: String,
      required: function () {
        return this.type !== "guest" && this.type !== "assistant";
      },
      default: "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg",
    },
    is_temporary: {
      type: Boolean,
      default: false, // Indicates if the user is temporary (e.g., guest)
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// UserSchema.index({ user_id: 1 });

UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: "string" } },
  }
);

const User = mongoose.model("User", UserSchema);

export { User };
