// routes/dashboardRoutes.js
import express from "express";
import {
  getPropertyDashboardData,
  getMonthlyRentCollectionData,
  getPropertyStatusData,
  getTenantQueryStatsData
} from "./dashboardController.js";

const router = express.Router();

router.get("/property-data",  getPropertyDashboardData);
router.get("/monthly-rent",  getMonthlyRentCollectionData);
router.get("/property-status-stats", getPropertyStatusData);
router.get("/tenant-query-stats",  getTenantQueryStatsData);

export default router;