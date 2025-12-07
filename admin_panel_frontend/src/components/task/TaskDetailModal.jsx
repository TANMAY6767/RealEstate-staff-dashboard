"use client";
import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Edit,
  Trash2,
  X,
  Tag,
  FileText,
  Clock as ClockIcon
} from "lucide-react";
import { format } from "date-fns";

const PRIORITY_COLORS = {
  urgent: {
    light: "bg-red-100 text-red-800",
    dark: "bg-red-900/20 text-red-300"
  },
  high: {
    light: "bg-orange-100 text-orange-800",
    dark: "bg-orange-900/20 text-orange-300"
  },
  medium: {
    light: "bg-yellow-100 text-yellow-800",
    dark: "bg-yellow-900/20 text-yellow-300"
  },
  low: {
    light: "bg-blue-100 text-blue-800",
    dark: "bg-blue-900/20 text-blue-300"
  }
};

const STATUS_CONFIG = {
  todo: { 
    title: "To Do", 
    light: { color: "bg-gray-100 text-gray-800" },
    dark: { color: "bg-gray-800 text-gray-300" }
  },
  in_progress: { 
    title: "In Progress", 
    light: { color: "bg-blue-100 text-blue-800" },
    dark: { color: "bg-blue-900/20 text-blue-300" }
  },
  review: { 
    title: "Review", 
    light: { color: "bg-purple-100 text-purple-800" },
    dark: { color: "bg-purple-900/20 text-purple-300" }
  },
  completed: { 
    title: "Completed", 
    light: { color: "bg-green-100 text-green-800" },
    dark: { color: "bg-green-900/20 text-green-300" }
  }
};

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onUpdateTask,
  users = []
}) {
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      // Implement comment addition logic here
      // await onAddComment(task._id, newComment);
      setNewComment("");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="border-b dark:border-gray-700 p-6 flex-shrink-0 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {task.title || 'Untitled Task'}
                </h2>
                <span className={`
                  px-4 py-1.5 rounded-full text-sm font-medium
                  ${PRIORITY_COLORS[task.priority]?.light || PRIORITY_COLORS.medium.light}
                  dark:${PRIORITY_COLORS[task.priority]?.dark || PRIORITY_COLORS.medium.dark}
                `}>
                  {task.priority || 'medium'}
                </span>
                <span className={`
                  px-4 py-1.5 rounded-full text-sm font-medium
                  ${STATUS_CONFIG[task.status]?.light.color || STATUS_CONFIG.todo.light.color}
                  dark:${STATUS_CONFIG[task.status]?.dark.color || STATUS_CONFIG.todo.dark.color}
                `}>
                  {STATUS_CONFIG[task.status]?.title || 'To Do'}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                {task.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(task)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                title="Edit Task"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(task._id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
                title="Delete Task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Task Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="w-5 h-5" />
                    Task Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assignee & Assignor */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Assignee</h4>
                        <div className="flex items-center gap-3">
                          {task.assignee?.image ? (
                            <img 
                              src={task.assignee.image} 
                              alt={task.assignee.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {task.assignee?.name || 'Unassigned'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                              {task.assignee?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Assignor</h4>
                        <div className="flex items-center gap-3">
                          {task.assignor?.image ? (
                            <img 
                              src={task.assignor.image} 
                              alt={task.assignor.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {task.assignor?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                              {task.assignor?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <div className={`
                        rounded-lg p-4 border
                        ${isOverdue 
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' 
                          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                        }
                      `}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Due Date
                          </h4>
                          {isOverdue && <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
                        </div>
                        <p className={`
                          text-lg font-semibold
                          ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}
                        `}>
                          {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No due date'}
                        </p>
                        {isOverdue && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            This task is overdue
                          </p>
                        )}
                      </div>

                      {task.completedDate && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completed Date
                          </h4>
                          <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                            {format(new Date(task.completedDate), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Estimates */}
                  {(task.estimatedHours > 0 || task.actualHours > 0) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Time Tracking
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {task.estimatedHours > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {task.estimatedHours} hours
                            </p>
                          </div>
                        )}
                        {task.actualHours > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Actual</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {task.actualHours} hours
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                {task.subTasks?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Subtasks ({task.subTasks.filter(st => st.completed).length}/{task.subTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {task.subTasks.map((subTask, idx) => (
                        <div key={idx} className="
                          flex items-center gap-3 p-3 
                          bg-white dark:bg-gray-800 
                          border dark:border-gray-700 rounded-lg 
                          hover:bg-gray-50 dark:hover:bg-gray-900/50
                        ">
                          <input
                            type="checkbox"
                            checked={subTask.completed || false}
                            onChange={(e) => onUpdateTask(task._id, {
                              subTasks: task.subTasks.map((st, i) => 
                                i === idx ? { ...st, completed: e.target.checked } : st
                              )
                            })}
                            className="w-5 h-5 rounded text-blue-600 dark:text-blue-500"
                          />
                          <div className="flex-1">
                            <p className={`
                              ${subTask.completed 
                                ? 'line-through text-gray-500 dark:text-gray-500' 
                                : 'text-gray-900 dark:text-gray-100'
                              }
                            `}>
                              {subTask.title || 'Untitled subtask'}
                            </p>
                            {subTask.completedAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Completed on {format(new Date(subTask.completedAt), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <MessageSquare className="w-5 h-5" />
                      Comments ({task.comments?.length || 0})
                    </h3>
                  </div>

                  {/* Add Comment */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full border dark:border-gray-700 rounded-lg p-3 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      rows="3"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || submittingComment}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? 'Adding...' : 'Add Comment'}
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {task.comments?.map((comment, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {comment.user?.image ? (
                            <img 
                              src={comment.user.image} 
                              alt={comment.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {comment.user?.name || 'Unknown'}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select 
                        value={task.status || 'todo'}
                        onChange={(e) => onUpdateTask(task._id, { status: e.target.value })}
                        className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                      <select 
                        value={task.priority || 'medium'}
                        onChange={(e) => onUpdateTask(task._id, { priority: e.target.value })}
                        className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignee</label>
                      <select 
                        value={task.assignee?._id || ""}
                        onChange={(e) => onUpdateTask(task._id, { assignee: e.target.value })}
                        className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Change Assignee</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ""}
                        onChange={(e) => onUpdateTask(task._id, { dueDate: e.target.value })}
                        className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Labels */}
                {task.labels?.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Tag className="w-5 h-5" />
                      Labels
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {task.labels.map((label, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Log */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Activity</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
                      </p>
                    </div>
                    {task.completedDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(task.completedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollbar Styles */}
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          .dark .custom-scrollbar {
            scrollbar-color: #4b5563 #1f2937;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </div>
    </div>
  );
}