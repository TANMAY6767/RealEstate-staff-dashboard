// services/feedbackService.js
import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

export const createAndDownloadInvoice = async (formData, router) => {
  const response = await apiClient.post("/invoice/generate", formData);
  return handleApiResponse(response, router);
};
export const getAllInvoices = async (payload, router) => {
  const response = await apiClient.get("/invoice", { params: payload });
  return handleApiResponse(response, router);
};
export const getInvoice = async (id, router) => {
  const response = await apiClient.get(`/invoice/${id}`);
  return handleApiResponse(response, router);
};
export const deleteInvoice = async (id, router) => {
  const response = await apiClient.get(`/invoice/${id}`);
  return handleApiResponse(response, router);
};
export const update_invoice_car_details = async (payload, router) => {
  const response = await apiClient.post(`/invoice/update_invoice_car_details`,payload);
  return handleApiResponse(response, router);
};
