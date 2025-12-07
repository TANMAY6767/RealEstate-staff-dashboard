import { apiClient } from "@/helper/commonHelper";
import { handleApiResponse } from "@/helper/zindex";

// Get all tasks
export const getTasks = async (params = {}) => {
  try {
    console.log("getTasks API call with params:", params);
    const response = await apiClient.get("/tasks", { params });
    console.log("getTasks API response:", response);
    return handleApiResponse(response);
  } catch (error) {
    console.error("getTasks API error:", error);
    throw error;
  }
};

// Get single task
export const getTask = async (id) => {
  const response = await apiClient.get(`/tasks/${id}`);
  return handleApiResponse(response);
};

// Create task
// Create task
export const createTask = async (taskData) => {
  try {
    console.log("createTask API call with data:", taskData);
    const response = await apiClient.post("/tasks", taskData);
    console.log("createTask API response:", response);
    
    // Ensure consistent response structure
    return {
      success: response.data?.success || true,
      data: response.data,
      error: response.data?.error || null
    };
  } catch (error) {
    console.error("createTask API error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Network error",
      data: null
    };
  }
};

// Update task
// Update task
export const updateTask = async (id, taskData) => {
  try {
    console.log("updateTask API call with data:", taskData);
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    console.log("updateTask API response:", response);
    
    return {
      success: response.data?.success || true,
      data: response.data,
      error: response.data?.error || null
    };
  } catch (error) {
    console.error("updateTask API error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Network error",
      data: null
    };
  }
};

// Delete task (archive)
export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return handleApiResponse(response);
};

// Add comment
export const addComment = async (taskId, comment) => {
  const response = await apiClient.post(`/tasks/${taskId}/comments`, { text: comment });
  return handleApiResponse(response);
};

// Update subtask
export const updateSubTask = async (taskId, subTaskIndex, completed) => {
  const response = await apiClient.put(`/tasks/${taskId}/subtasks/${subTaskIndex}`, { completed });
  return handleApiResponse(response);
};

// Get task statistics
export const getTaskStats = async (timeframe = 'month') => {
  const response = await apiClient.get("/tasks/stats", { params: { timeframe } });
  return handleApiResponse(response);
};

// Bulk update task status
export const bulkUpdateTaskStatus = async (updates) => {
  const response = await apiClient.put("/tasks/bulk/status", { updates });
  return handleApiResponse(response);
};

// Get users for assignee dropdown
export const getUsersForAssign = async () => {
  try {
    console.log("getUsersForAssign API call");
    const response = await apiClient.get("/user_management/all");
    console.log("getUsersForAssign API response:", response);
    return handleApiResponse(response);
  } catch (error) {
    console.error("getUsersForAssign API error:", error);
    throw error;
  }
};