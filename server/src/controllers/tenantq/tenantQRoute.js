import express from "express";
import {
    createOrUpdateTenantQ,
    getAllTenantQs,
    getTenantQ,
    deleteTenantQ,
    updateTenantQStatus,
    getTenantQsByProperty
} from "./tenantQController.js";
import upload from "../../middlewares/multer.middleware.js";

const tenantQRoute = express.Router();

// Main CRUD routes
tenantQRoute
    .route("/")
    .post(
        upload.fields([{ name: "image", maxCount: 1 }]),
        createOrUpdateTenantQ
    )
    .get(getAllTenantQs);

// Get all tenant queries (alternative endpoint)
tenantQRoute.get("/all", getAllTenantQs);

// Get tenant queries by property
tenantQRoute.get("/property/:propertyId", getTenantQsByProperty);

// Single tenant query operations
tenantQRoute.route("/:id")
    .get(getTenantQ)
    .delete(deleteTenantQ);

// Update status
tenantQRoute.patch("/:id/status", updateTenantQStatus);

export default tenantQRoute;