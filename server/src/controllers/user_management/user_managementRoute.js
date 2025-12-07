import express from "express";
import { createOrUpdateUser, getAllUsers, deleteUser, getUser } from "./user_managementController.js";

const router = express.Router();

router.post("/create", createOrUpdateUser);
router.get("/all", getAllUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);

export default router;
