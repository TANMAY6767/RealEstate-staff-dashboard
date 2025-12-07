// models/RentCollection.js
import mongoose from "mongoose";

const RentCollectionSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"]
    },
    tenant_name: {
      type: String,
      required: [true, "Tenant name is required"],
      trim: true
    },
    tenant_email: {
      type: String,
      required: [true, "Tenant email is required"],
      trim: true,
      lowercase: true
    },
    tenant_phone: {
      type: String,
      trim: true
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      enum: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [2100, "Year must be 2100 or earlier"]
    },
    rent_amount: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: [0, "Rent amount must be positive"]
    },
    paid_amount: {
      type: Number,
      required: [true, "Paid amount is required"],
      min: [0, "Paid amount must be positive"]
    },
    due_date: {
      type: Date,
      required: [true, "Due date is required"]
    },
    paid_date: {
      type: Date,
      default: Date.now
    },
    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer", "check", "online", "card", "other"],
      default: "cash"
    },
    transaction_id: {
      type: String,
      trim: true
    },
    receipt_number: {
      type: String,
      trim: true
    },
    payment_proof: {
      type: String // URL to uploaded image
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "overdue"],
      default: "pending"
    },
    notes: {
      type: String,
      trim: true
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewed_at: {
      type: Date
    },
    review_notes: {
      type: String,
      trim: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating balance
RentCollectionSchema.virtual("balance").get(function() {
  return this.rent_amount - this.paid_amount;
});

// Virtual for payment status text
RentCollectionSchema.virtual("payment_status").get(function() {
  if (this.paid_amount === 0) return "Unpaid";
  if (this.paid_amount < this.rent_amount) return "Partial";
  if (this.paid_amount === this.rent_amount) return "Full";
  return "Overpaid";
});

// Indexes for better query performance
RentCollectionSchema.index({ property_id: 1, month: 1, year: 1 }, { unique: true });
RentCollectionSchema.index({ status: 1 });
RentCollectionSchema.index({ due_date: 1 });
RentCollectionSchema.index({ tenant_email: 1 });

// Middleware to validate paid_amount <= rent_amount
RentCollectionSchema.pre("save", function(next) {
  if (this.paid_amount > this.rent_amount) {
    next(new Error("Paid amount cannot exceed rent amount"));
  }
  next();
});

export default mongoose.model("RentCollection", RentCollectionSchema);