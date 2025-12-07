import express from "express";
// import { upload } from "../../middlewares/multer.middleware.js";

const userRoute = express.Router();

import { loginUser } from "./userController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

userRoute.post("/login", loginUser); // login

userRoute.use(verifyJWT);
// userRoute.post("/create", upload.fields([{ name: "image", maxCount: 1 }]), createUser); // signup

// userRoute.patch("/details", (req, res) => {
//     res.send("User details updated");
// });

userRoute.get("/", (req, res) => {
    res.send("User details fetched");
});

export { userRoute };