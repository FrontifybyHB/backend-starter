import mongoose from "mongoose";

/**
 * User Schema
 * Handles authentication & authorization
 */
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false, // 🚨 very important (won't return by default)
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            select: false,
        },
    },
    {
        timestamps: true, // createdAt & updatedAt
    }
);

const User = mongoose.model("User", userSchema);

export default User;
