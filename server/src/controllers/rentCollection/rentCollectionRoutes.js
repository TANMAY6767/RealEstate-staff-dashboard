// routes/rentCollectionRoutes.js
import express from "express";
import {
  createRentCollection,
  getAllRentCollections,
  getRentCollection,
  updateRentCollectionStatus,
  deleteRentCollection,
  getRentStatistics
} from "./rentCollectionController.js";
import upload from "../../middlewares/multer.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(verifyJWT);

// Rent Collection Routes
router.route("/")
  .post(
    upload.fields([{ name: "payment_proof", maxCount: 1 }]),
    createRentCollection
  )
  .get(getAllRentCollections);

router.route("/statistics").get(getRentStatistics);

router.route("/:id")
  .get(getRentCollection)
  .delete(deleteRentCollection);

router.patch("/:id/status", updateRentCollectionStatus);

export default router;