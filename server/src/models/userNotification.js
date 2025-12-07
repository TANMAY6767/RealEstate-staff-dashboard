// models/UserNotification.js
import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        notification: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification",
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        read_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Compound index for better performance
userNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
userNotificationSchema.index({ user: 1, notification: 1 }, { unique: true });

export default mongoose.model("UserNotification", userNotificationSchema);
