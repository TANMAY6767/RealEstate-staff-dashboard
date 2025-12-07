import mongoose from "mongoose";

const rolemapperSchema = new mongoose.Schema(
    {
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        page: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            required: true,
            default: false
        },
        edit: {
            type: Boolean,
            required: true,
            default: false
        },
        delete: {
            type: Boolean,
            required: true,
            default: false
        },
        download: {
            type: Boolean,
            required: true,
            default: false
        },
        // created_by: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User"
        // },
        // updated_by: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User"
        // }
    },
    { timestamps: true }
);

export default mongoose.model("Role_Mapper", rolemapperSchema);

// Add to your rolemapperSchema
rolemapperSchema.index({ page: "text" });
rolemapperSchema.index({ role_id: 1 });
