// services/dashboard/dashboardServices.js
import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const getPropertyDashboardData = async (payload) => {
  const response = await apiClient.get("/dashboard/property-data", { params: payload });
  return handleApiResponse(response);
};

export const getRentCollectionStats = async (payload) => {
  const response = await apiClient.get("/dashboard/rent-stats", { params: payload });
  return handleApiResponse(response);
};

export const getTenantQueryStats = async (payload) => {
  const response = await apiClient.get("/dashboard/tenant-query-stats", { params: payload });
  return handleApiResponse(response);
};

export const getPropertyStatusStats = async (payload) => {
  const response = await apiClient.get("/dashboard/property-status-stats", { params: payload });
  return handleApiResponse(response);
};

export const getRecentActivities = async (payload) => {
  const response = await apiClient.get("/dashboard/recent-activities", { params: payload });
  return handleApiResponse(response);
};

export const getMonthlyRentCollection = async (payload) => {
  const response = await apiClient.get("/dashboard/monthly-rent", { params: payload });
  return handleApiResponse(response);
};