import {
    createNotification,
    getallNotifications,
    getUserNotifications,
    updateUserNotification,
    createNotificationForUsers
} from "../../utils/notificationHelper.js";
import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";

// Get all notifications (admin/system)
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getallNotifications(page, limit);

    return sendResponse(res, true, result, "Notifications fetched successfully", statusType.OK);
});

// Get notifications for specific user
export const getUserNotificationList = asyncHandler(async (req, res) => {
    const user_id = req.user._id; // Assuming user is authenticated and user ID is available
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getUserNotifications(user_id, page, limit);

    return sendResponse(
        res,
        true,
        result,
        "User notifications fetched successfully",
        statusType.OK
    );
});

// Update user notification (mark as read)
export const updateUserNotificationStatus = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    // const { notificationId } = req.body;

    // if (!notificationId) {
    //     return sendResponse(
    //         res,
    //         false,
    //         null,
    //         "Notification ID is required",
    //         statusType.BAD_REQUEST
    //     );
    // }

    await updateUserNotification(user_id);

    return sendResponse(res, true, null, "Notification updated successfully", statusType.OK);
});

// Mark all user notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const user_id = req.user._id;

    await updateUserNotification(user_id);

    return sendResponse(res, true, null, "All notifications marked as read", statusType.OK);
});

// Create notification (admin)
export const createNewNotification = asyncHandler(async (req, res) => {
    const { title, message, type, userIds, category } = req.body;

    if (!title || !message || !type) {
        return sendResponse(
            res,
            false,
            null,
            "Title, message and type are required",
            statusType.BAD_REQUEST
        );
    }

    const notification = await createNotificationForUsers({
        title,
        message,
        type,
        userIds,
        category
    });

    return sendResponse(
        res,
        true,
        notification,
        "Notification created successfully",
        statusType.CREATED
    );
});
