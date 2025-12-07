"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STATUS_CONFIG = {
  todo: { title: "To Do" },
  in_progress: { title: "In Progress" },
  review: { title: "Review" },
  completed: { title: "Completed" }
};

export default function TaskForm({
  showModal,
  onClose,
  onSubmit,
  users = [],
  initialData = null,
  title = "Create New Task"
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    dueDate: "",
    labels: [],
    estimatedHours: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "todo",
        priority: initialData.priority || "medium",
        assignee: initialData.assignee?._id || initialData.assignee || "",
        dueDate: initialData.dueDate 
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        labels: initialData.labels || [],
        estimatedHours: initialData.estimatedHours || 0
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        labels: [],
        estimatedHours: 0
      });
    }
    setError("");
  }, [initialData, showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        if (!initialData) {
          setFormData({
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            assignee: "",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            labels: [],
            estimatedHours: 0
          });
        }
      } else {
        setError("Failed to save task. Please check the form data and try again.");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const toggleLabel = (label) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label]
    }));
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b dark:border-gray-700 p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows="4"
                  placeholder="Describe the task..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Task Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignee *
                  </label>
                  <select
                    name="assignee"
                    required
                    className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.assignee}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Assignee</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.dueDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  min="0"
                  step="0.5"
                  className="w-full border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="0"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {['design', 'development', 'bug', 'feature', 'maintenance', 'documentation', 'meeting'].map(label => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => toggleLabel(label)}
                    disabled={loading}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${formData.labels.includes(label)
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {formData.labels.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected labels:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.labels.map(label => (
                      <span key={label} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="border-t dark:border-gray-700 pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}