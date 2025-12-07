import mongoose from "mongoose";

const TenantQSchema = new mongoose.Schema(
    {
        Tenant_property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property"
        },
        Testimonial: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (value) {
                    return value.trim().length > 0;
                },
                message: "Testimonial cannot be empty"
            }
        },

        Status: {
            type: String,
            enum: ["resolved", "pending", "draft"], // Add "draft" to enum
            required: true,
            default: "draft" // Lowercase to match enum
        },
        image: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("TenantQ", TenantQSchema);
