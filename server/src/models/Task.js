import mongoose from "mongoose";
import Project from "../models/Project.js";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    completedDate: {
      type: Date
    },
    labels: [{
      type: String,
      enum: ['design', 'development', 'bug', 'feature', 'maintenance', 'documentation', 'meeting']
    }],
    attachments: [{
      url: String,
      fileName: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: Date
    }],
    subTasks: [{
      title: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    estimatedHours: {
      type: Number,
      min: 0
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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

// Indexes for better query performance
taskSchema.index({ status: 1, assignee: 1 });
taskSchema.index({ assignee: 1, dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ property: 1 });

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  const now = new Date();
  return this.dueDate < now;
});

export default mongoose.model("Task", taskSchema);