import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        image: {
            type: String,
            default: null
        },
        refresh_token: String,
        token_version: {
            type: Number,
            default: 0
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
