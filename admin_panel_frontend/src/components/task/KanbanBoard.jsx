"use client";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Grid,
  List,
  Users,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { getTasks, createTask, updateTask, deleteTask, getTaskStats, bulkUpdateTaskStatus, getUsersForAssign } from "@/services/task/taskServices";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Import new components
import TaskForm from "./TaskForm";
import TaskDetailModal from "./TaskDetailModal";

const PRIORITY_COLORS = {
  urgent: {
    light: "bg-red-100 text-red-800 border-red-200",
    dark: "bg-red-900/20 text-red-300 border-red-800"
  },
  high: {
    light: "bg-orange-100 text-orange-800 border-orange-200",
    dark: "bg-orange-900/20 text-orange-300 border-orange-800"
  },
  medium: {
    light: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dark: "bg-yellow-900/20 text-yellow-300 border-yellow-800"
  },
  low: {
    light: "bg-blue-100 text-blue-800 border-blue-200",
    dark: "bg-blue-900/20 text-blue-300 border-blue-800"
  }
};

const STATUS_CONFIG = {
  todo: { 
    title: "To Do", 
    light: { color: "bg-gray-100 text-gray-800", countColor: "bg-gray-200 text-gray-800" },
    dark: { color: "bg-gray-800 text-gray-300", countColor: "bg-gray-700 text-gray-300" },
    icon: "📋"
  },
  in_progress: { 
    title: "In Progress", 
    light: { color: "bg-blue-100 text-blue-800", countColor: "bg-blue-200 text-blue-800" },
    dark: { color: "bg-blue-900/20 text-blue-300", countColor: "bg-blue-800/30 text-blue-300" },
    icon: "🔄"
  },
  review: { 
    title: "Review", 
    light: { color: "bg-purple-100 text-purple-800", countColor: "bg-purple-200 text-purple-800" },
    dark: { color: "bg-purple-900/20 text-purple-300", countColor: "bg-purple-800/30 text-purple-300" },
    icon: "👀"
  },
  completed: { 
    title: "Completed", 
    light: { color: "bg-green-100 text-green-800", countColor: "bg-green-200 text-green-800" },
    dark: { color: "bg-green-900/20 text-green-300", countColor: "bg-green-800/30 text-green-300" },
    icon: "✅"
  }
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    review: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    assignee: "all",
    priority: "all",
    search: ""
  });
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");
  const [activeFilter, setActiveFilter] = useState(false);
  const [allTasks, setAllTasks] = useState([]);

  // Fetch tasks and users
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    const debugResponse = async () => {
      const testResponse = await getTasks({});
      console.log("DEBUG - Full API Response:", testResponse);
    };
    debugResponse();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== "all") params.status = filters.status;
      if (filters.assignee !== "all") params.assignee = filters.assignee;
      if (filters.priority !== "all") params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const response = await getTasks(params);
      
      if (response.data?.success || response.success) {
        const data = response.data?.data || response.data;
        const groupedTasks = data?.groupedTasks || {};
        
        setTasks({
          todo: Array.isArray(groupedTasks.todo) ? groupedTasks.todo : [],
          in_progress: Array.isArray(groupedTasks.in_progress) ? groupedTasks.in_progress : [],
          review: Array.isArray(groupedTasks.review) ? groupedTasks.review : [],
          completed: Array.isArray(groupedTasks.completed) ? groupedTasks.completed : []
        });
        
        if (Array.isArray(data?.tasks)) {
          setAllTasks(data.tasks);
        } else if (Array.isArray(data)) {
          setAllTasks(data);
        } else {
          setAllTasks([]);
        }
      } else {
        console.error("Failed to fetch tasks:", response);
        toast.error(response.data?.error || response.error || "Failed to load tasks");
        resetTasksState();
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
      resetTasksState();
    } finally {
      setLoading(false);
    }
  };

  const resetTasksState = () => {
    setTasks({
      todo: [],
      in_progress: [],
      review: [],
      completed: []
    });
    setAllTasks([]);
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsersForAssign();
      let usersList = [];
      
      if (response.data?.data?.users && Array.isArray(response.data.data.users)) {
        usersList = response.data.data.users;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        usersList = response.data.users;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersList = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersList = response.data;
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTaskStats();
      if (response.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      
      if (response.data?.success || response.success) {
        toast.success(response.data?.message || "Task created successfully");
        setShowTaskForm(false);
        
        if (response.data?.data) {
          const newTask = response.data.data;
          setTasks(prevTasks => ({
            ...prevTasks,
            [newTask.status]: [...prevTasks[newTask.status], newTask]
          }));
          setAllTasks(prev => [...prev, newTask]);
        }
        
        await fetchTasks();
        await fetchStats();
        return true;
      } else {
        const errorMessage = response.data?.error || response.error || "Failed to create task";
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
      return false;
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await updateTask(taskId, updates);
      
      if (response.data?.success || response.success) {
        toast.success(response.data?.message || "Task updated successfully");
        fetchTasks();
        fetchStats();
        
        if (showTaskDetail && showTaskDetail._id === taskId) {
          setShowTaskDetail(prev => ({
            ...prev,
            ...updates
          }));
        }
        return true;
      } else {
        const errorMessage = response.data?.error || response.error || "Failed to update task";
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      return false;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const response = await deleteTask(taskId);
      if (response.success) {
        toast.success("Task deleted successfully");
        setShowTaskDetail(null);
        fetchTasks();
        fetchStats();
      } else {
        toast.error(response.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const sourceStatus = result.source.droppableId;
    const destStatus = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceStatus === destStatus) return;

    try {
      await bulkUpdateTaskStatus([{ taskId, status: destStatus }]);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const renderTaskCard = (task, index) => (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm 
            p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow
            ${snapshot.isDragging ? 'shadow-lg border-blue-300 dark:border-blue-600' : ''}
          `}
          onClick={() => setShowTaskDetail(task)}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100">
              {task.title || 'Untitled Task'}
            </h4>
            <span className={`
              text-xs px-2 py-1 rounded-full border
              ${PRIORITY_COLORS[task.priority]?.light || PRIORITY_COLORS.medium.light}
              dark:${PRIORITY_COLORS[task.priority]?.dark || PRIORITY_COLORS.medium.dark}
            `}>
              {task.priority || 'medium'}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description || 'No description'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee?.image ? (
                <img 
                  src={task.assignee.image} 
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={`
                  flex items-center gap-1 text-xs
                  ${new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalTasks || 0}
            </p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {stats?.activeTasks || 0} active, {stats?.completedTasks || 0} completed
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.completionRate || 0}%
            </p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks completed
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.overdueTasks || 0}
            </p>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Tasks past due date
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.length}
            </p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Available for task assignment
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Task Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage team tasks efficiently
            </p>
          </div>
          
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {stats && renderStats()}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Status:</label>
              <select 
                className="border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Assignee:</label>
              <select 
                className="border dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                value={filters.assignee}
                onChange={(e) => setFilters({...filters, assignee: e.target.value})}
              >
                <option value="all">All Assignees</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveFilter(!activeFilter)}
              className="flex items-center gap-2 px-3 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Filter className="w-4 h-4" />
              More Filters
            </button>

            <div className="flex items-center border dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-2 transition-colors ${
                  viewMode === "kanban" 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
              const statusTasks = tasks[statusKey] || [];
              const isLight = true; // You might want to get this from a theme context
              const colors = isLight ? config.light : config.dark;
              
              return (
                <div key={statusKey} className="flex flex-col">
                  <div className={`p-3 rounded-t-lg ${colors.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <h3 className="font-semibold">{config.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.countColor}`}>
                        {statusTasks.length}
                      </span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={statusKey}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          flex-1 p-3 border-x border-b rounded-b-lg min-h-[500px] transition-colors
                          ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-gray-900/50'}
                          dark:border-gray-700
                        `}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center h-full">
                            <RefreshCw className="w-6 h-6 text-gray-400 dark:text-gray-600 animate-spin" />
                          </div>
                        ) : statusTasks.length > 0 ? (
                          statusTasks.map((task, index) => renderTaskCard(task, index))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No tasks in this column</p>
                            <p className="text-sm mt-1">Drag tasks here or create new ones</p>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Task</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Assignee</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-gray-400 dark:text-gray-600 animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : allTasks.length > 0 ? (
                  allTasks.map((task) => (
                    <tr key={task._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {task.title || 'Untitled Task'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {task.description || 'No description'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          px-3 py-1 rounded-full text-sm
                          ${STATUS_CONFIG[task.status]?.light.color || STATUS_CONFIG.todo.light.color}
                          dark:${STATUS_CONFIG[task.status]?.dark.color || STATUS_CONFIG.todo.dark.color}
                        `}>
                          {STATUS_CONFIG[task.status]?.title || 'To Do'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`
                          px-3 py-1 rounded-full text-sm
                          ${PRIORITY_COLORS[task.priority]?.light || PRIORITY_COLORS.medium.light}
                          dark:${PRIORITY_COLORS[task.priority]?.dark || PRIORITY_COLORS.medium.dark}
                        `}>
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {task.assignee?.image ? (
                            <img 
                              src={task.assignee.image} 
                              alt={task.assignee.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <span className="text-gray-700 dark:text-gray-300">
                            {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-1 ${
                          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                        </div>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => setShowTaskDetail(task)}
                          className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No tasks found. Create your first task!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        showModal={showTaskForm || !!editingTask}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={async (taskData) => {
          if (editingTask) {
            const success = await handleUpdateTask(editingTask._id, taskData);
            if (success) {
              setEditingTask(null);
              setShowTaskForm(false);
            }
          } else {
            const success = await handleCreateTask(taskData);
            if (success) {
              setShowTaskForm(false);
            }
          }
        }}
        users={users}
        initialData={editingTask}
        title={editingTask ? "Edit Task" : "Create New Task"}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={showTaskDetail}
        onClose={() => setShowTaskDetail(null)}
        onEdit={(task) => {
          setEditingTask(task);
          setShowTaskDetail(null);
        }}
        onDelete={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
        users={users}
      />
    </div>
  );
}