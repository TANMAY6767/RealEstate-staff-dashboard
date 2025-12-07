import Task from "../../models/Task.js";
import User from "../../models/user.js";
import mongoose from "mongoose";
import Project from "../../models/Project.js";

// Get all tasks with filters
export const getTasks = async (req, res) => {
  try {
    const { 
      status, 
      assignee, 
      assignor, 
      project, 
      property, 
      priority,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const query = { isArchived: false };
    
    // Apply filters
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (assignor) query.assignor = assignor;
    if (project) query.project = project;
    if (property) query.property = property;
    if (priority) query.priority = priority;
    
    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email image')
        .populate('assignor', 'name email image')
        .populate('project', 'name')
        .populate('property', 'title address')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(query)
    ]);

    // Group by status for kanban view
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      review: tasks.filter(task => task.status === 'review'),
      completed: tasks.filter(task => task.status === 'completed')
    };

    res.status(200).json({
      success: true,
      data: {
        tasks,
        groupedTasks: tasksByStatus,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
      details: error.message
    });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid task ID"
      });
    }

    const task = await Task.findById(id)
      .populate('assignee', 'name email image')
      .populate('assignor', 'name email image')
      .populate('project', 'name description')
      .populate('property', 'title address')
      .populate('comments.user', 'name email image')
      .lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
      details: error.message
    });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignor: req.user._id,
      created_by: req.user._id,
      updated_by: req.user._id
    };

    // Validate assignee exists
    const assignee = await User.findById(taskData.assignee);
    if (!assignee) {
      return res.status(400).json({
        success: false,
        error: "Assignee not found"
      });
    }

    const task = new Task(taskData);
    await task.save();

    // Populate references
    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email image')
      .populate('assignor', 'name email image')
      .populate('project', 'name')
      .populate('property', 'title address');

    res.status(201).json({
      success: true,
      data: populatedTask,
      message: "Task created successfully"
    });
  } catch (error) {
    console.error("Error creating task:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create task",
      details: error.message
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid task ID"
      });
    }

    const updates = {
      ...req.body,
      updated_by: req.user._id
    };

    // If status is changed to completed, set completedDate
    if (updates.status === 'completed' && updates.status !== req.body.originalStatus) {
      updates.completedDate = new Date();
    }

    // If assignee is changing, validate new assignee exists
    if (updates.assignee) {
      const assignee = await User.findById(updates.assignee);
      if (!assignee) {
        return res.status(400).json({
          success: false,
          error: "Assignee not found"
        });
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email image')
      .populate('assignor', 'name email image')
      .populate('project', 'name')
      .populate('property', 'title address')
      .populate('comments.user', 'name email image');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task updated successfully"
    });
  } catch (error) {
    console.error("Error updating task:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update task",
      details: error.message
    });
  }
};

// Delete task (soft delete - archive)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid task ID"
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { isArchived: true, updated_by: req.user._id },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Task archived successfully"
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
      details: error.message
    });
  }
};

// Add comment to task
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid task ID"
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            user: req.user._id,
            text,
            createdAt: new Date()
          }
        },
        updated_by: req.user._id
      },
      { new: true }
    )
      .populate('assignee', 'name email image')
      .populate('assignor', 'name email image')
      .populate('comments.user', 'name email image');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    const newComment = task.comments[task.comments.length - 1];

    res.status(200).json({
      success: true,
      data: newComment,
      message: "Comment added successfully"
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details: error.message
    });
  }
};

// Update subtask status
export const updateSubTask = async (req, res) => {
  try {
    const { id, subTaskIndex } = req.params;
    const { completed } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid task ID"
      });
    }

    const updateKey = `subTasks.${subTaskIndex}.completed`;
    const updateKey2 = `subTasks.${subTaskIndex}.completedAt`;
    
    const updateData = {
      [updateKey]: completed,
      updated_by: req.user._id
    };

    if (completed) {
      updateData[updateKey2] = new Date();
    } else {
      updateData[updateKey2] = null;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('assignee', 'name email image')
      .populate('assignor', 'name email image');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      data: task.subTasks[subTaskIndex],
      message: "Subtask updated successfully"
    });
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update subtask",
      details: error.message
    });
  }
};

// Get task statistics
// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get all stats for ALL users, not just current user
    const stats = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isArchived: false
        }
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 }, 
          avgHours: { $avg: '$estimatedHours' } 
        } 
      }
    ]);

    // Calculate completion rate for ALL tasks
    const completedTasks = await Task.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate },
      isArchived: false
    });

    const totalTasks = await Task.countDocuments({
      createdAt: { $gte: startDate },
      isArchived: false
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;

    // Get overdue tasks for ALL users
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
      isArchived: false
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        completionRate: Math.round(completionRate),
        totalTasks,
        completedTasks,
        overdueTasks,
        activeTasks: totalTasks - completedTasks
      }
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task statistics",
      details: error.message
    });
  }
};

// Bulk update task status (for drag and drop)
export const bulkUpdateTaskStatus = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No updates provided"
      });
    }

    const bulkOperations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.taskId },
        update: { 
          status: update.status,
          updated_by: req.user._id,
          ...(update.status === 'completed' ? { completedDate: new Date() } : {})
        }
      }
    }));

    const result = await Task.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      },
      message: "Tasks updated successfully"
    });
  } catch (error) {
    console.error("Error bulk updating tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update tasks",
      details: error.message
    });
  }
};