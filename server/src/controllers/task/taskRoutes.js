import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  updateSubTask,
  getTaskStats,
  bulkUpdateTaskStatus
} from "./taskController.js";


const router = express.Router();

// All routes require authentication


// Task routes
router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/comments", addComment);
router.put("/:id/subtasks/:subTaskIndex", updateSubTask);
router.put("/bulk/status", bulkUpdateTaskStatus);

export default router;