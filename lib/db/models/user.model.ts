import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model("User", userSchema);
