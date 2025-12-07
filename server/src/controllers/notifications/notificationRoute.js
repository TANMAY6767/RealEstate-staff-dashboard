import express from "express";
import {
    getNotifications,
    getUserNotificationList,
    updateUserNotificationStatus,
    markAllNotificationsAsRead,
    createNewNotification
} from "./notificationController.js";

const router = express.Router();

// Public routes (if any)
router.get("/", getNotifications);

// Protected routes
router.get("/user", getUserNotificationList);
router.post("/mark-read", updateUserNotificationStatus);
router.put("/mark-all-read", markAllNotificationsAsRead);
router.post("/create", createNewNotification);

// SSE route for real-time notifications
const clients = [];

router.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const clientId = Date.now();
    const client = { id: clientId, res, userId: req.user._id };
    clients.push(client);

    req.on("close", () => {
        clients.splice(
            clients.findIndex((c) => c.id === clientId),
            1
        );
    });
});

export const sendNotificationToClients = (type, userIds = null) => {
    clients.forEach((client) => {
        // Send to specific users or all clients
        if (!userIds || userIds.includes(client.userId)) {
            client.res.write(`data: ${JSON.stringify({ type })}\n\n`);
        }
    });
};

export default router;
