// services/feedbackService.js
import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const createOrUpdateProperty = async (formData, router) => {
  const response = await apiClient.post("/property/create", formData,{
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return handleApiResponse(response, router);
};

export const getAllProperty = async (payload, router) => {
  const response = await apiClient.get("/property", { params: payload });
  return handleApiResponse(response, router);
};

export const getProperty = async (id, router) => {
  const response = await apiClient.get(`/property/${id}`);
  return handleApiResponse(response, router);
};

export const deleteProperty = async (PropertyId, router) => {
  const response = await apiClient.delete(`/property/${PropertyId}`);
  return handleApiResponse(response, router);
};
export const deleteMainImage = async (PropertyId, router) => {
  const response = await apiClient.delete(`/property/${PropertyId}`);
  return handleApiResponse(response, router);
};
export const deleteOtherImage = async (PropertyId, router) => {
  const response = await apiClient.delete(`/property/${PropertyId}`);
  return handleApiResponse(response, router);
};

