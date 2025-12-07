// models/Car.js
import mongoose from "mongoose";
import Counter from "./Counter.js";

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        property_index_id: {
            type: String, // Keep string if you want "C00001"
            unique: true
        },
        description: {
            type: String
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        main_image: {
            type: String // URL to the image
        },
        // Pula (Botswana) prices
        city: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        // Zambian Kwacha prices
        price: {
            type: Number,
            required: true
        },
        owner_email: {
            type: String,
            required: true,
            trim: true
        },
        owner_name: {
            type: String // URL to the image
        },
     
        status: {
            type: String,
            enum: ["available", "rented","sold"],
            default:"available",
            required: true
        },
       
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

// Pre-save hook to auto-increment property_index_id
propertySchema.pre("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { name: "property_id" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // Assign the incremented value
        this.property_index_id = `C${counter.seq.toString().padStart(5, "0")}`;
    }
    next();
});

// Indexes
propertySchema.index({ title: "text", address: "text" });

export default mongoose.model("Property", propertySchema);
