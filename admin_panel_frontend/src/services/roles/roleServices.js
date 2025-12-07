import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const save_role = async (formData, router) => {
  const response = await apiClient.post("/role/create", formData);
  return handleApiResponse(response, router);
};

export const delete_role = async (roleId, router) => {
  const response = await apiClient.delete(`/role/${roleId}`);
  return handleApiResponse(response, router);
};

export const get_all_roles = async (payload, router) => {
  const response = await apiClient.get(`/role/all`, { params: payload });
  
  console.log(response)
  return handleApiResponse(response, router);
};

export const get_role = async (id, router) => {
  const response = await apiClient.get(`/role/${id}`);
  return handleApiResponse(response, router);
};
