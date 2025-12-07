// controllers/carController.js
import Property from "../../models/Property.js";
import role from "../../models/role.js";

import PropertyImage from "../../models/PropertyImage.js";
import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { createNotification } from "../../utils/notificationHelper.js";
import mongoose from "mongoose";
import { sendNotificationToClients } from "../notifications/notificationRoute.js";

export const createOrUpdateProperty = asyncHandler(async (req, res) => {
  const {
    property_id,      // present ➜ update, absent ➜ create
    title,
    description,
    address,
    city,
    postalCode,
    price,
    owner_email,
    owner_name,
    status
  } = req.body;

  /* ---------- 1.  validation  ---------- */
  if (
    !title?.trim() ||
    !address?.trim() ||
    !city?.trim() ||
    !postalCode ||
    !price ||
    !owner_email?.trim() ||
    !owner_name?.trim()
  ) {
    return sendResponse(
      res,
      false,
      null,
      "Title, address, city, postal-code, price, owner e-mail and owner name are required",
      statusType.BAD_REQUEST
    );
  }

  /* ---------- 2.  session  ---------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  let property;
  try {
    if (property_id) {
      /* =========================================================
       * UPDATE
       * =======================================================*/
      property = await Property.findById(property_id).session(session);
      if (!property) {
        await session.abortTransaction();
        return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
      }

      /* update fields */
      property.title = title.trim();
      property.description = description?.trim() || "";
      property.address = address.trim();
      property.city = city.trim();
      property.postalCode = postalCode;
      property.price = price;
      property.owner_email = owner_email.trim();
      property.owner_name = owner_name.trim();
      property.status = status?.trim() || property.status;
      property.updated_by = req.user._id;

      /* main image */
      if (req.files?.main_image?.[0]) {
        if (property.main_image) await deleteOnCloudinary(property.main_image);
        const up = await uploadOnCloudinary(req.files.main_image[0].path);
        property.main_image = up.url;
      }

      await property.save({ session });

      /* other images */
      if (req.files?.other_images?.length) {
        const imgs = [];
        for (const file of req.files.other_images) {
          const up = await uploadOnCloudinary(file.path);
          imgs.push({ property_id: property._id, image_url: up.url });
        }
        await PropertyImage.insertMany(imgs, { session });
      }
    } else {
      /* =========================================================
       * CREATE
       * =======================================================*/
      let mainImageUrl = null;
      if (req.files?.main_image?.[0]) {
        mainImageUrl = (await uploadOnCloudinary(req.files.main_image[0].path)).url;
      }

      const [newCar] = await Property.create(
        [
          {
            title: title.trim(),
            description: description?.trim() || "",
            address: address.trim(),
            city: city.trim(),
            postalCode,
            price,
            owner_email: owner_email.trim(),
            owner_name: owner_name.trim(),
            main_image: mainImageUrl,
            status: status?.trim() || "pending",
            created_by: req.user._id,
            updated_by: req.user._id
          }
        ],
        { session }
      );
      property = newCar;

      /* other images */
      if (req.files?.other_images?.length) {
        const imgs = [];
        for (const file of req.files.other_images) {
          const up = await uploadOnCloudinary(file.path);
          imgs.push({ property_id: property._id, image_url: up.url });
        }
        await PropertyImage.insertMany(imgs, { session });
      }
    }

    /* ---------- 3.  commit  ---------- */
    await session.commitTransaction();
    session.endSession();

    /* ---------- 4.  populated response  ---------- */
    const populated = await Property.aggregate([
      { $match: { _id: property._id } },
      {
        $lookup: {
          from: "propertyimages",
          localField: "_id",
          foreignField: "property_id",
          as: "images"
        }
      },
      {
        $project: {
          _id: 1,
          property_index_id: 1,
          title: 1,
          description: 1,
          address: 1,
          city: 1,
          postalCode: 1,
          price: 1,
          owner_email: 1,
          owner_name: 1,
          status: 1,
          main_image: 1,
          images: 1,
          created_by: 1,
          updated_by: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $limit: 1 }
    ]);

    /* ---------- 5.  notification  ---------- */
    const action = property_id ? "updated" : "created";
    const userRole = await role.findById(req.user.role);
    await createNotification({
      title: `Property ${action}`,
      message: `Property ${action} by ${userRole.name}: ${req.user.name}`,
      type: action
    });
    sendNotificationToClients("notification_update");

    /* ---------- 6.  send  ---------- */
    return sendResponse(
      res,
      true,
      { property: populated[0] },
      property_id ? "Property updated successfully" : "Property created successfully",
      statusType.SUCCESS
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const getAllProperty = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;
    const address = req.query.address;
    const title = req.query.title;

    // Build filter
    const filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (status) filter.status = status;

    if (address) {
        filter.address = { $regex: address, $options: "i" };
    }

    if (title) {
        filter.title = { $regex: title, $options: "i" };
    }

    // Aggregation
    const cars = await Property.aggregate([
        { $match: filter },

        {
            $lookup: {
                from: "propertyimages",
                localField: "_id",
                foreignField: "property_id",
                as: "images"
            }
        },

        {
            $lookup: {
                from: "users",
                let: { createdById: "$created_by" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$createdById"] } } },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "created_by"
            }
        },

        {
            $lookup: {
                from: "users",
                let: { updatedById: "$updated_by" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$updatedById"] } } },
                    { $project: { name: 1, _id: 1 } }
                ],
                as: "updated_by"
            }
        },

        { $unwind: { path: "$created_by", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$updated_by", preserveNullAndEmptyArrays: true } },

        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    const totalCars = await Property.countDocuments(filter);
    const totalPages = Math.ceil(totalCars / limit);

    return sendResponse(
        res,
        true,
        {
            cars,
            pagination: {
                totalPages,
                currentPage: page,
                totalCars,
                itemsPerPage: limit
            }
        },
        "Cars fetched successfully",
        statusType.OK
    );
});

export const getProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const property = await Property.findById(id)
        .populate("created_by", "name email")
        .populate("updated_by", "name email");

    if (!property) {
        return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
    }


    const carImages = await PropertyImage.find({ property_id: id });

    return sendResponse(
        res,
        true,
        { property, carImages },
        "Property fetched successfully",
        statusType.OK
    );
});

export const deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
        return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let committed = false;

    try {
        // Delete main image
        if (property.main_image) {
            await deleteOnCloudinary(property.main_image);
        }

        // Delete other images
        const carImages = await PropertyImage.find({ property_id: id }).session(session);
        for (const image of carImages) {
            await deleteOnCloudinary(image.image_url);
        }

        await PropertyImage.deleteMany({ property_id: id }).session(session);

        // Delete the property
        await Property.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        committed = true;
        session.endSession();

        // ---- AFTER transaction safely done ----
        const userRole = await role.findById(req.user.role);
        await createNotification({
            title: "Property deleted",
            message: `Property deleted by ${userRole.name}: ${req.user.name}`,
            type: "delete"
        });

        return sendResponse(
            res,
            true,
            null,
            "Property deleted successfully",
            statusType.OK
        );
    } catch (error) {
        if (!committed) {
            await session.abortTransaction();
        }
        session.endSession();
        throw error;
    }
});

export const deleteMainImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
        return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
    }

    if (!property.main_image) {
        return sendResponse(res, false, null, "No main image to delete", statusType.BAD_REQUEST);
    }

    // Delete from cloudinary
    await deleteOnCloudinary(property.main_image);

    // Update property
    property.main_image = null;
    property.updated_by = req.user._id;
    await property.save();

    return sendResponse(res, true, null, "Main image deleted successfully", statusType.OK);
});

export const deleteOtherImage = asyncHandler(async (req, res) => {
    const { carId, imageId } = req.params;

    const property = await Property.findById(carId);
    if (!property) {
        return sendResponse(res, false, null, "Property not found", statusType.NOT_FOUND);
    }

    const image = await PropertyImage.findOne({ _id: imageId, property_id: carId });
    if (!image) {
        return sendResponse(res, false, null, "Image not found", statusType.NOT_FOUND);
    }

    // Delete from cloudinary
    await deleteOnCloudinary(image.image_url);

    // Delete from database
    await PropertyImage.findByIdAndDelete(imageId);

    return sendResponse(res, true, null, "Image deleted successfully", statusType.OK);
});


// controllers/carController.js
// controllers/propertyController.js
export const getPropertiesForDropdown = asyncHandler(async (req, res) => {
  try {
    const { status = "rented", search = "" } = req.query;
    
    // Build filter
    const filter = {};
    
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { owner_email: { $regex: searchRegex } },
        { owner_name: { $regex: searchRegex } },
        { city: { $regex: searchRegex } }
      ];
    }
    
    // Add status filter if needed (e.g., only show active/rented properties)
    // filter.status = "rented"; // or "active" depending on your needs

    const properties = await Property.find(
      filter,
      {
        _id: 1,
        title: 1,
        address: 1,
        city: 1,
        postalCode: 1,
        owner_name: 1,
        owner_email: 1,
        price: 1,
        status: 1
      }
    )
    .sort({ title: 1 })
    .limit(100)
    .lean();

    // Format for dropdown
    const dropdownProperties = properties.map(property => ({
      _id: property._id.toString(),
      value: property._id.toString(),
      label: `${property.title} - ${property.address}`,
      title: property.title || "Untitled Property",
      address: property.address || "",
      city: property.city || "",
      postalCode: property.postalCode || "",
      owner_name: property.owner_name || "",
      owner_email: property.owner_email || "",
      price: property.price || 0,
      status: property.status || "active",
      displayText: `${property.title} | ${property.address} | ${property.owner_name || property.owner_email}`
    }));

    return sendResponse(
      res,
      true,
      { data: dropdownProperties, count: dropdownProperties.length },
      "Properties fetched successfully for dropdown",
      statusType.OK
    );
  } catch (error) {
    console.error("Dropdown properties error:", error);
    return sendResponse(
      res,
      false,
      null,
      "Failed to fetch properties",
      statusType.INTERNAL_SERVER_ERROR
    );
  }
});