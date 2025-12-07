import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const getAllNotification = async (payload, router) => {
  const response = await apiClient.get("/notifications", { params: payload });
  return handleApiResponse(response, router);
};
export const getUserNotificationList = async (payload, router) => {
  const response = await apiClient.get("/notifications/user", { params: payload });
  return handleApiResponse(response, router);
};
export const updateUserNotificationStatus = async (payload, router) => {
  const response = await apiClient.post("/notifications/mark-read",payload );
  return handleApiResponse(response, router);
};
