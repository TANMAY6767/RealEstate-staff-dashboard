import User from "../../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    asyncHandler,
    uploadOnCloudinary,
    deleteOnCloudinary,
    statusType,
    sendResponse
} from "../../utils/index.js";
import Role_Mapper from "../../models/role_mapper.js"; // <-- add this import

// Token generator functions
const generateAccessToken = (user) => {
    return jwt.sign({ user_id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user_id: user._id,
            role: user.role,
            token_version: user.token_version || 0
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

const cookieOptions = {
    httpOnly: true, // Prevent XSS access
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "Strict" // CSRF protection
};

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendResponse(
            res,
            false,
            null,
            "Email and Password are required",
            statusType.BAD_REQUEST
        );
    }

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
        return sendResponse(res, false, null, "User does not exist", statusType.BAD_REQUEST);
    }

    const isMatch = password === user.password;
    if (!isMatch) {
        return sendResponse(
            res,
            false,
            null,
            "Email or Password is incorrect",
            statusType.BAD_REQUEST
        );
    }

    const maps = await Role_Mapper.find({ role_id: user.role._id }).lean();
    const permissions = maps.flatMap((m) =>
        ["read", "edit", "delete", "download"]
            .filter((op) => m[op] === true)
            .map((op) => ({ page: m.page, operation: op }))
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refresh_token = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userData = user.toObject();
    delete userData.password;
    delete userData.refresh_token;
    return sendResponse(
        res,
        true,
        {
            User: { ...userData, accessToken },
            permissions
        },
        "Login Successful",
        statusType.OK
    );
});