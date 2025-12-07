import User from "../../models/user.js";
import Role from "../../models/role.js";
import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";
import bcrypt from "bcryptjs";

// Create or Update User
export const createOrUpdateUser = asyncHandler(async (req, res) => {
    const { user_id, name, email, password, role, image } = req.body;

    // Validate input
    if (!name || !email || !role) {
        return sendResponse(
            res,
            false,
            null,
            "Name, email, and role are required",
            statusType.BAD_REQUEST
        );
    }

    // Check if role exists
    const roleExists = await Role.findById(role);
    if (!roleExists) {
        return sendResponse(res, false, null, "Role not found", statusType.NOT_FOUND);
    }

    let user;
    if (user_id) {
        // Update existing user
        user = await User.findById(user_id);
        if (!user) {
            return sendResponse(res, false, null, "User not found", statusType.NOT_FOUND);
        }

        // Update user details
        user.name = name;
        user.email = email;
        user.role = role;
        if (image) user.image = image;

        // Update password if provided
        // if (password) {
            // user.password = await bcrypt.hash(password, 12);
            user.password = password;
        // }

        await user.save();
    } else {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, false, null, "User already exists", statusType.BAD_REQUEST);
        }

        // Create new user
        // const hashedPassword = await bcrypt.hash(password, 12);
        user = await User.create({
            name,
            email,
            password: password,
            role,
            image: image || null
        });
    }

    const message = user_id ? "User updated successfully" : "User created successfully";
    return sendResponse(res, true, user, message, statusType.SUCCESS);
});

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
        ? {
              $or: [
                  { name: { $regex: search, $options: "i" } },
                  { email: { $regex: search, $options: "i" } }
              ]
          }
        : {};

    // Get users with pagination and populate role details
    const users = await User.find(searchFilter)
        .populate("role", "name")
        .select("-password")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count
    const totalUsers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUsers / limit);

    return sendResponse(
        res,
        true,
        {
            users,
            pagination: {
                totalPages,
                currentPage: page,
                totalUsers,
                itemsPerPage: limit
            }
        },
        "Users fetched successfully",
        statusType.OK
    );
});

// Get Single User
export const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).populate("role", "name description");

    if (!user) {
        return sendResponse(res, false, null, "User not found", statusType.NOT_FOUND);
    }

    return sendResponse(res, true, user, "User fetched successfully", statusType.OK);
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return sendResponse(res, false, null, "User not found", statusType.NOT_FOUND);
    }

    await User.findByIdAndDelete(id);
    return sendResponse(res, true, null, "User deleted successfully", statusType.OK);
});
