// routes/carRoutes.js
import express from "express";
import {
    createOrUpdateProperty,
    getAllProperty,
    getProperty,
    deleteProperty,
    deleteMainImage,
    deleteOtherImage,
    getPropertiesForDropdown
    // exportCarsToExcel,
    // exportCarsToExcelWithHyperlinks
} from "./propertyController.js";
// import { protect } from "../middleware/authMiddleware.js";
import upload from "../../middlewares/multer.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes are protected
// router.use(protect);
router.get("/dropdown", getPropertiesForDropdown);
router.route("/").get(getAllProperty);

router.post(
    "/create",
    upload.fields([
        { name: "main_image", maxCount: 1 },
        { name: "other_images", maxCount: 10 }
    ]),
    createOrUpdateProperty
);



router.get("/getAll", getAllProperty);

router.route("/:id").get(getProperty).delete(deleteProperty);

router.route("/:id/main-image").delete(deleteMainImage);

router.route("/:propertyId/other-images/:imageId").delete(deleteOtherImage);

// router.get("/export/excel", exportCarsToExcel);

// router.get("/export/excel-with-hyperlinks", exportCarsToExcelWithHyperlinks);

export default router;
