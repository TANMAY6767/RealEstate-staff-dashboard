// controllers/rentCollectionController.js
import RentCollection from "../../models/RentCollection.js";
import Property from "../../models/Property.js";
import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

// ✅ Create Rent Collection Record
export const createRentCollection = asyncHandler(async (req, res) => {
  const {
    property_id,
    tenant_name,
    tenant_email,
    tenant_phone,
    month,
    year,
    rent_amount,
    paid_amount,
    due_date,
    payment_method,
    transaction_id,
    receipt_number,
    notes,
    status = "pending"
  } = req.body;

  // Validation
  if (!property_id || !tenant_name || !tenant_email || !month || !year || !rent_amount || !paid_amount || !due_date) {
    return sendResponse(
      res,
      false,
      null,
      "Required fields: property_id, tenant_name, tenant_email, month, year, rent_amount, paid_amount, due_date",
      statusType.BAD_REQUEST
    );
  }

  // Check if property exists
  const property = await Property.findById(property_id);
  if (!property) {
    return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
  }

  // Check for duplicate rent record for same property, month, and year
  const existingRecord = await RentCollection.findOne({
    property_id,
    month,
    year
  });

  if (existingRecord) {
    return sendResponse(
      res,
      false,
      null,
      `Rent record for ${month} ${year} already exists for this property`,
      statusType.BAD_REQUEST
    );
  }

  // Handle payment proof upload
  let payment_proof = null;
  if (req.files?.payment_proof?.[0]) {
    const uploadResult = await uploadOnCloudinary(req.files.payment_proof[0].path);
    payment_proof = uploadResult.url;
  }

  // Create rent collection record
  const rentCollection = await RentCollection.create({
    property_id,
    tenant_name,
    tenant_email,
    tenant_phone,
    month,
    year: parseInt(year),
    rent_amount: parseFloat(rent_amount),
    paid_amount: parseFloat(paid_amount),
    due_date: new Date(due_date),
    payment_method,
    transaction_id,
    receipt_number,
    payment_proof,
    notes,
    status,
    created_by: req.user._id,
    updated_by: req.user._id
  });

  // Populate property details
  const populatedRecord = await RentCollection.findById(rentCollection._id)
    .populate("property_id", "title address city owner_name owner_email")
    .populate("created_by", "name email");

  return sendResponse(
    res,
    true,
    { rentCollection: populatedRecord },
    "Rent collection record created successfully",
    statusType.CREATED
  );
});

// ✅ Get All Rent Collection Records with Filtering
export const getAllRentCollections = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    month,
    year,
    property_id,
    search,
    startDate,
    endDate
  } = req.query;

  // Build filter
  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (month) {
    filter.month = month;
  }

  if (year) {
    filter.year = parseInt(year);
  }

  if (property_id) {
    filter.property_id = property_id;
  }

  if (startDate && endDate) {
    filter.paid_date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Search functionality
  if (search) {
    filter.$or = [
      { tenant_name: { $regex: search, $options: "i" } },
      { tenant_email: { $regex: search, $options: "i" } },
      { receipt_number: { $regex: search, $options: "i" } },
      { transaction_id: { $regex: search, $options: "i" } },
      { "property_id.title": { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  const parsedLimit = parseInt(limit);

  // Aggregation pipeline
  const rentCollections = await RentCollection.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "properties",
        localField: "property_id",
        foreignField: "_id",
        as: "property"
      }
    },
    { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "created_by",
        foreignField: "_id",
        as: "created_by"
      }
    },
    { $unwind: { path: "$created_by", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "reviewed_by",
        foreignField: "_id",
        as: "reviewed_by"
      }
    },
    { $unwind: { path: "$reviewed_by", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        tenant_name: 1,
        tenant_email: 1,
        tenant_phone: 1,
        month: 1,
        year: 1,
        rent_amount: 1,
        paid_amount: 1,
        due_date: 1,
        paid_date: 1,
        payment_method: 1,
        transaction_id: 1,
        receipt_number: 1,
        payment_proof: 1,
        status: 1,
        notes: 1,
        review_notes: 1,
        reviewed_at: 1,
        createdAt: 1,
        updatedAt: 1,
        balance: { $subtract: ["$rent_amount", "$paid_amount"] },
        "property._id": 1,
        "property.title": 1,
        "property.address": 1,
        "property.city": 1,
        "property.owner_name": 1,
        "property.owner_email": 1,
        "created_by.name": 1,
        "created_by.email": 1,
        "reviewed_by.name": 1,
        "reviewed_by.email": 1
      }
    },
    { $sort: { due_date: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: parsedLimit }
  ]);

  const totalRecords = await RentCollection.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / parsedLimit);

  return sendResponse(
    res,
    true,
    {
      rentCollections,
      pagination: {
        total: totalRecords,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parsedLimit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      summary: {
        totalRent: rentCollections.reduce((sum, record) => sum + record.rent_amount, 0),
        totalPaid: rentCollections.reduce((sum, record) => sum + record.paid_amount, 0),
        totalBalance: rentCollections.reduce((sum, record) => sum + (record.rent_amount - record.paid_amount), 0),
        pendingCount: await RentCollection.countDocuments({ ...filter, status: "pending" }),
        approvedCount: await RentCollection.countDocuments({ ...filter, status: "approved" }),
        rejectedCount: await RentCollection.countDocuments({ ...filter, status: "rejected" })
      }
    },
    "Rent collection records fetched successfully",
    statusType.SUCCESS
  );
});

// ✅ Get Single Rent Collection Record
export const getRentCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, false, null, "Invalid rent collection ID", statusType.BAD_REQUEST);
  }

  const rentCollection = await RentCollection.findById(id)
    .populate("property_id", "title address city postalCode price owner_name owner_email")
    .populate("created_by", "name email")
    .populate("reviewed_by", "name email");

  if (!rentCollection) {
    return sendResponse(res, false, null, "Rent collection record not found", statusType.NOT_FOUND);
  }

  return sendResponse(
    res,
    true,
    { rentCollection },
    "Rent collection record fetched successfully",
    statusType.SUCCESS
  );
});

// ✅ Update Rent Collection Status (Approve/Reject)
export const updateRentCollectionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, review_notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, false, null, "Invalid rent collection ID", statusType.BAD_REQUEST);
  }

  if (!status || !["approved", "rejected"].includes(status)) {
    return sendResponse(
      res,
      false,
      null,
      "Status must be either 'approved' or 'rejected'",
      statusType.BAD_REQUEST
    );
  }

  const rentCollection = await RentCollection.findById(id);
  if (!rentCollection) {
    return sendResponse(res, false, null, "Rent collection record not found", statusType.NOT_FOUND);
  }

  // Check if already reviewed
  if (rentCollection.status !== "pending") {
    return sendResponse(
      res,
      false,
      null,
      `This record is already ${rentCollection.status}`,
      statusType.BAD_REQUEST
    );
  }

  // Update status
  rentCollection.status = status;
  rentCollection.review_notes = review_notes || "";
  rentCollection.reviewed_by = req.user._id;
  rentCollection.reviewed_at = new Date();
  rentCollection.updated_by = req.user._id;

  await rentCollection.save();

  const populatedRecord = await RentCollection.findById(id)
    .populate("property_id", "title address city")
    .populate("reviewed_by", "name email");

  return sendResponse(
    res,
    true,
    { rentCollection: populatedRecord },
    `Rent collection record ${status} successfully`,
    statusType.SUCCESS
  );
});

// ✅ Delete Rent Collection Record
export const deleteRentCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, false, null, "Invalid rent collection ID", statusType.BAD_REQUEST);
  }

  const rentCollection = await RentCollection.findByIdAndDelete(id);
  if (!rentCollection) {
    return sendResponse(res, false, null, "Rent collection record not found", statusType.NOT_FOUND);
  }

  return sendResponse(
    res,
    true,
    null,
    "Rent collection record deleted successfully",
    statusType.SUCCESS
  );
});

// ✅ Get Rent Statistics
export const getRentStatistics = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();

  const statistics = await RentCollection.aggregate([
    {
      $match: {
        year: parseInt(currentYear),
        status: "approved"
      }
    },
    {
      $group: {
        _id: "$month",
        totalRent: { $sum: "$rent_amount" },
        totalPaid: { $sum: "$paid_amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        _id: 1 // Sort by month index
      }
    }
  ]);

  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Ensure all months are present
  const completeStatistics = monthOrder.map(month => {
    const monthData = statistics.find(stat => stat._id === month);
    return monthData || {
      _id: month,
      totalRent: 0,
      totalPaid: 0,
      count: 0
    };
  });

  return sendResponse(
    res,
    true,
    { statistics: completeStatistics, year: currentYear },
    "Rent statistics fetched successfully",
    statusType.SUCCESS
  );
});