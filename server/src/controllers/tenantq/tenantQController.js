// controllers/tenantQController.js
import TenantQ from "../../models/TenantQ.js";
import Property from "../../models/Property.js"; // Add this import
import mongoose from "mongoose";
import { asyncHandler, sendResponse, statusType, uploadOnCloudinary } from "../../utils/index.js";

// ✅ Create or Update Tenant Query
export const createOrUpdateTenantQ = asyncHandler(async (req, res) => {
    const { tenant_id, Tenant_property, Testimonial, Status } = req.body;
    const imageFile = req.files && req.files.image ? req.files.image[0] : null;
    const imageUrl = imageFile ? await uploadOnCloudinary(imageFile.path) : null;
    const image = imageUrl?.url;

    // Validate input
    if (!Tenant_property || !Testimonial || !Status) {
        return sendResponse(
            res,
            false,
            null,
            "Tenant_property, Testimonial and Status are required",
            statusType.BAD_REQUEST
        );
    }

    // Validate Testimonial not empty
    if (Testimonial.trim().length === 0) {
        return sendResponse(
            res,
            false,
            null,
            "Testimonial cannot be empty",
            statusType.BAD_REQUEST
        );
    }

    // Validate Tenant_property is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(Tenant_property)) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid Tenant_property ID",
            statusType.BAD_REQUEST
        );
    }

    // Check if property exists
    const propertyExists = await Property.findById(Tenant_property);
    if (!propertyExists) {
        return sendResponse(
            res,
            false,
            null,
            "Property not found",
            statusType.NOT_FOUND
        );
    }

    let tenantQuery;
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();

        if (tenant_id) {
            // ✅ Update existing tenant query
            tenantQuery = await TenantQ.findByIdAndUpdate(
                tenant_id,
                { Tenant_property, Testimonial, Status, ...(image && { image }) },
                { new: true, runValidators: true, session }
            ).populate("Tenant_property", "title address city postalCode owner_name owner_email price status");

            if (!tenantQuery) {
                await session.abortTransaction();
                return sendResponse(
                    res,
                    false,
                    null,
                    "Tenant query not found",
                    statusType.NOT_FOUND
                );
            }
        } else {
            // ✅ Create new tenant query
            tenantQuery = await TenantQ.create([{
                Tenant_property,
                Testimonial,
                Status,
                image
            }], { session });

            tenantQuery = tenantQuery[0];
            
            // Populate the Tenant_property field with property details
            tenantQuery = await TenantQ.findById(tenantQuery._id)
                .populate("Tenant_property", "title address city postalCode owner_name owner_email price status")
                .session(session);
        }

        await session.commitTransaction();
        
        const message = tenant_id
            ? "Tenant query updated successfully"
            : "Tenant query created successfully";

        return sendResponse(
            res,
            true,
            tenantQuery,
            message,
            tenant_id ? statusType.SUCCESS : statusType.CREATED
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// ✅ Get all Tenant Queries with pagination
export const getAllTenantQs = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        status, 
        search,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
    } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
        query.Status = status;
    }

    // Add search functionality
    if (search) {
        query.$or = [
            { Testimonial: { $regex: search, $options: 'i' } },
        ];
        
        // Also search in populated property fields
        const propertyMatches = await Property.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { owner_name: { $regex: search, $options: 'i' } },
                { owner_email: { $regex: search, $options: 'i' } }
            ]
        }).select('_id');
        
        if (propertyMatches.length > 0) {
            const propertyIds = propertyMatches.map(p => p._id);
            query.$or.push({ Tenant_property: { $in: propertyIds } });
        }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [tenantQueries, totalCount] = await Promise.all([
        TenantQ.find(query)
            .populate({
                path: 'Tenant_property',
                select: 'title address city postalCode owner_name owner_email price status',
                model: 'Property'
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit)),
        TenantQ.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = parseInt(page);

    const response = {
        tenantQueries,
        pagination: {
            total: totalCount,
            totalPages,
            currentPage,
            pageSize: parseInt(limit),
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        }
    };

    return sendResponse(
        res,
        true,
        response,
        "All tenant queries fetched successfully",
        statusType.SUCCESS
    );
});

// ✅ Get single tenant query by ID
export const getTenantQ = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid tenant query ID",
            statusType.BAD_REQUEST
        );
    }

    const tenantQuery = await TenantQ.findById(id)
        .populate({
            path: 'Tenant_property',
            select: 'title address city postalCode owner_name owner_email price status',
            model: 'Property'
        });

    if (!tenantQuery) {
        return sendResponse(
            res,
            false,
            null,
            "Tenant query not found",
            statusType.NOT_FOUND
        );
    }

    return sendResponse(
        res,
        true,
        tenantQuery,
        "Tenant query fetched successfully",
        statusType.SUCCESS
    );
});

// ✅ Delete tenant query by ID
export const deleteTenantQ = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid tenant query ID",
            statusType.BAD_REQUEST
        );
    }

    const tenantQuery = await TenantQ.findByIdAndDelete(id);
    
    if (!tenantQuery) {
        return sendResponse(
            res,
            false,
            null,
            "Tenant query not found",
            statusType.NOT_FOUND
        );
    }

    return sendResponse(
        res,
        true,
        null,
        "Tenant query deleted successfully",
        statusType.SUCCESS
    );
});

// ✅ Update tenant query status
export const updateTenantQStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid tenant query ID",
            statusType.BAD_REQUEST
        );
    }

    if (!Status || !["resolved", "pending", "draft"].includes(Status)) {
        return sendResponse(
            res,
            false,
            null,
            "Status must be either 'resolved', 'pending', or 'draft'",
            statusType.BAD_REQUEST
        );
    }

    const tenantQuery = await TenantQ.findByIdAndUpdate(
        id,
        { Status },
        { new: true, runValidators: true }
    ).populate({
        path: 'Tenant_property',
        select: 'title address city postalCode owner_name owner_email price status',
        model: 'Property'
    });

    if (!tenantQuery) {
        return sendResponse(
            res,
            false,
            null,
            "Tenant query not found",
            statusType.NOT_FOUND
        );
    }

    return sendResponse(
        res,
        true,
        tenantQuery,
        "Tenant query status updated successfully",
        statusType.SUCCESS
    );
});

// ✅ Get tenant queries by property ID
export const getTenantQsByProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid property ID",
            statusType.BAD_REQUEST
        );
    }

    const query = { Tenant_property: propertyId };
    if (status) {
        query.Status = status;
    }

    const tenantQueries = await TenantQ.find(query)
        .sort({ createdAt: -1 })
        .populate({
            path: 'Tenant_property',
            select: 'title address city postalCode owner_name owner_email price status',
            model: 'Property'
        });

    return sendResponse(
        res,
        true,
        tenantQueries,
        "Tenant queries fetched successfully",
        statusType.SUCCESS
    );
});