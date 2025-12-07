import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description:{
            type:String,
            required:false
        }
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

export default mongoose.model("Role", roleSchema);

roleSchema.index({ name: "text" });
