// services/tenantQ/tenantQServices.js
import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const createOrUpdateTenantQ = async (formData, router) => {
  const response = await apiClient.post("/tenantq", formData);
  return handleApiResponse(response, router);
};

export const getAllTenantQs = async (payload, router) => {
  const response = await apiClient.get("/tenantq/all", { params: payload });
  return handleApiResponse(response, router);
};

export const getTenantQ = async (id, router) => {
  const response = await apiClient.get(`/tenantq/${id}`);
  return handleApiResponse(response, router);
};

export const deleteTenantQ = async (tenantQId, router) => {
  const response = await apiClient.delete(`/tenantq/${tenantQId}`);
  return handleApiResponse(response, router);
};

export const updateTenantQStatus = async (id, statusData, router) => {
  const response = await apiClient.patch(`/tenantq/${id}/status`, statusData);
  return handleApiResponse(response, router);
};

export const getPropertysForDropdown = async (router) => {
  const response = await apiClient.get("/property/dropdown");
  return handleApiResponse(response, router);
};