import Role from "../../models/role.js";
import Role_Mapper from "../../models/role_mapper.js";
import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";
import User from "../../models/user.js";
import { sendNotificationToClients } from "../notifications/notificationRoute.js";
// Create Role
export const createOrUpdateRole = asyncHandler(async (req, res) => {
    const { role_id, role_name, description, permissions } = req.body;

    // Validate input
    if (!role_name || !permissions) {
        return sendResponse(
            res,
            false,
            null,
            "Role name and permissions are required",
            statusType.BAD_REQUEST
        );
    }

    let role;
    if (role_id) {
        // Update existing role
        role = await Role.findById(role_id);
        if (!role) {
            return sendResponse(res, false, null, "Role not found", statusType.NOT_FOUND);
        }

        // Update role details
        role.name = role_name.toLowerCase();
        role.description = description;
        await role.save();

        // Remove existing permissions
        await Role_Mapper.deleteMany({ role_id: role_id });

        sendNotificationToClients("role_updated");
    } else {
        // Check if role already exists (for creation only)
        const existingRole = await Role.findOne({ name: role_name.toLowerCase() });
        if (existingRole) {
            return sendResponse(res, false, null, "Role already exists", statusType.BAD_REQUEST);
        }

        // Create new role
        role = await Role.create({ name: role_name.toLowerCase(), description: description });
    }

    // Prepare new role mapper entries
    const roleMappers = permissions.map((permission) => ({
        role_id: role._id,
        page: permission.page.toLowerCase(),
        read: permission.read || false,
        edit: permission.edit || false,
        delete: permission.delete || false,
        download: permission.download || false
    }));

    // Insert updated permissions
    await Role_Mapper.insertMany(roleMappers);

    const message = role_id ? "Role updated successfully" : "Role created successfully";
    return sendResponse(res, true, null, message, statusType.SUCCESS);
});

export const getAllRoles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
        ? {
              $or: [
                  { name: { $regex: search, $options: "i" } },
                  { "permissions.page": { $regex: search, $options: "i" } }
              ]
          }
        : {};

    // Get roles with search, pagination, and permission count
    const roles = await Role.aggregate([
        {
            $lookup: {
                from: "role_mappers",
                localField: "_id",
                foreignField: "role_id",
                as: "permissions"
            }
        },
        { $match: searchFilter },
        // Preserve roles with no permissions using preserveNullAndEmptyArrays
        { $unwind: { path: "$permissions", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                permissionCount: {
                    $sum: [
                        { $cond: [{ $ifNull: ["$permissions.read", false] }, 1, 0] },
                        { $cond: [{ $ifNull: ["$permissions.write", false] }, 1, 0] },
                        { $cond: [{ $ifNull: ["$permissions.edit", false] }, 1, 0] },
                        { $cond: [{ $ifNull: ["$permissions.delete", false] }, 1, 0] },
                        { $cond: [{ $ifNull: ["$permissions.download", false] }, 1, 0] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                description: { $first: "$description" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                totalPermissionNo: { $sum: "$permissionCount" }
            }
        },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    // Get total count of matching documents
    const totalRoles = await Role.aggregate([
        {
            $lookup: {
                from: "role_mappers",
                localField: "_id",
                foreignField: "role_id",
                as: "permissions"
            }
        },
        { $match: searchFilter },
        { $count: "total" }
    ]);

    const total = totalRoles[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return sendResponse(
        res,
        true,
        {
            roles,
            pagination: {
                totalPages,
                currentPage: page,
                totalRoles: total,
                itemsPerPage: limit
            }
        },
        "Roles fetched successfully",
        statusType.OK
    );
});

// Delete Role
export const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
        return sendResponse(res, false, null, "Role not found", statusType.NOT_FOUND);
    }

    // Check if role is being used by any user
    const usersWithRole = await User.find({ role: role.name });

    if (usersWithRole.length > 0) {
        return sendResponse(
            res,
            false,
            null,
            "Cannot delete role. It is assigned to one or more users.",
            statusType.BAD_REQUEST
        );
    }

    // Delete role and its permissions (using transaction for atomicity)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Role_Mapper.deleteMany({ role_id: id }).session(session);
        await Role.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        return sendResponse(res, true, null, "Role deleted successfully", statusType.OK);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return sendResponse(
            res,
            false,
            null,
            "Error deleting role",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// Get Single Role with Permissions
export const getRole = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
        return sendResponse(res, false, null, "Role not found", statusType.NOT_FOUND);
    }

    // Get role permissions
    const permissions = await Role_Mapper.find({ role_id: id });

    return sendResponse(
        res,
        true,
        { role, permissions },
        "Role fetched successfully",
        statusType.OK
    );
});
