import express from "express";
import { createOrUpdateRole, getAllRoles, deleteRole, getRole } from "./rolesController.js";

const router = express.Router();

router.post("/create", createOrUpdateRole);
router.get("/all", getAllRoles);
router.get("/:id", getRole);
router.delete("/:id", deleteRole);

export default router;
