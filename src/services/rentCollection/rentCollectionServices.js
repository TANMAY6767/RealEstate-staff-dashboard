// services/rentCollection/rentCollectionServices.js
import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

// Create Rent Collection Record
export const createRentCollection = async (formData, router) => {
  const response = await apiClient.post("/rent-collection", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return handleApiResponse(response, router);
};

// Get All Rent Collection Records
export const getAllRentCollections = async (payload, router) => {
  const response = await apiClient.get("/rent-collection", { params: payload });
  return handleApiResponse(response, router);
};

// Get Single Rent Collection Record
export const getRentCollection = async (id, router) => {
  const response = await apiClient.get(`/rent-collection/${id}`);
  return handleApiResponse(response, router);
};

// Update Rent Collection Status
export const updateRentCollectionStatus = async (id, statusData, router) => {
  const response = await apiClient.patch(`/rent-collection/${id}/status`, statusData);
  return handleApiResponse(response, router);
};

// Delete Rent Collection Record
export const deleteRentCollection = async (id, router) => {
  const response = await apiClient.delete(`/rent-collection/${id}`);
  return handleApiResponse(response, router);
};

// Get Rent Statistics
export const getRentStatistics = async (payload, router) => {
  const response = await apiClient.get("/rent-collection/statistics", { params: payload });
  return handleApiResponse(response, router);
};

// Get Properties for Dropdown (You already have this)
export const getPropertiesForRent = async (router) => {
  const response = await apiClient.get("/property/dropdown");
  return handleApiResponse(response, router);
};