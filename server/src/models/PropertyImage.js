// models/PropertyImage.js
import mongoose from "mongoose";

const propertyImageSchema = new mongoose.Schema(
    {
        property_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true
        },
        image_url: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

propertyImageSchema.index({ property_id: 1 });

export default mongoose.model("PropertyImage", propertyImageSchema);
