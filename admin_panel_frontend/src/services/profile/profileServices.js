import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const getProfile = async (router) => {
  const response = await apiClient.get("/profile");
  return handleApiResponse(response, router);
};

export const updateCompany = async (formData, router) => {
  const response = await apiClient.put("/profile/company", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return handleApiResponse(response, router);
};

export const createOrUpdateBank = async (payload, router) => {
  const response = await apiClient.post("/profile/bank", payload);
  return handleApiResponse(response, router);
};

export const deleteBank = async (bankId, router) => {
  const response = await apiClient.delete(`/profile/bank/${bankId}`);
  return handleApiResponse(response, router);
};

export const setActiveBank = async (payload, router) => {
  const response = await apiClient.put(`/profile/bank/${payload.id}/active`,payload);
  return handleApiResponse(response, router);
};
