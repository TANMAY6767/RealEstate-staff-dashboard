import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./controllers/user/userRoutes.js";
import roleRouter from "./controllers/roles/rolesRouter.js";
import userRouter from "./controllers/user_management/user_managementRoute.js";
import tenantQRoute from "./controllers/tenantq/tenantQRoute.js";
import rentRouter from "./controllers/rentCollection/rentCollectionRoutes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import propertyRouter from "./controllers/property/PropertyRouter.js.js"
import taskRoutes from "./controllers/task/taskRoutes.js";
import notificationRouter from "./controllers/notifications/notificationRoute.js";
import dashboardRouter from "./controllers/dashboard/dashboardRoutes.js"
const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://staging.redapplecars.com",
            "http://localhost:3001",
            "https://staging-bs.redapplecars.com"
        ],
        credentials: true
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRoute);

app.use(verifyJWT);
app.use("/api/tenantq", tenantQRoute);
app.use("/api/tasks", taskRoutes);
app.use("/api/property", propertyRouter);
app.use("/api/rent-collection", rentRouter);
app.use("/api/role", roleRouter);
app.use("/api/user_management", userRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/dashboard", dashboardRouter);

export { app };
