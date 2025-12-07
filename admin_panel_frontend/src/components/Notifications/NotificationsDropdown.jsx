"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, CheckCircle2, AlertCircle, Info, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllNotification,
  getUserNotificationList,
  updateUserNotificationStatus
} from "@/services/notification/notificationServices";
import { apiClientEvents } from "@/helper/commonHelper";
import { format } from "date-fns";
import { toast } from "sonner";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const markAsReadTimeoutRef = useRef(null);
  const hasMarkedAsReadRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserNotificationList({});

      if (response && response.data && response.data.status) {
        const newNotifications = response.data.data.notifications || [];
        const pagination = response.data.data.pagination || {};

        setNotifications(newNotifications);
        setTotal(pagination.total || 0);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const evtSource = apiClientEvents.events("/notifications/stream", {
      onMessage: (msg) => {
       
        if (msg.type == "notification_update") {
          fetchNotifications();
        }
      },
      onError: (err) => {
        console.error("SSE error:", err);
      }
    });

    return () => evtSource.close();
  }, [fetchNotifications]);

  // Function to mark notifications as read
  const markNotificationsAsRead = useCallback(async () => {
    try {
      // Get unread notification IDs
      const unreadNotifications = notifications
        .filter((notification) => !notification.notification.read)
        .map((notification) => notification._id);

      if (unreadNotifications.length === 0) return;

      // Call the update notification status API
      const response = await updateUserNotificationStatus({
        notificationIds: unreadNotifications,
        status: "read"
      });

      if (response && response.data && response.data.status) {
        // Update local state to mark as read
        setNotifications((prev) =>
          prev.map((notif) =>
            unreadNotifications.includes(notif._id)
              ? {
                  ...notif,
                  notification: {
                    ...notif.notification,
                    read: true
                  }
                }
              : notif
          )
        );
        hasMarkedAsReadRef.current = true;
        console.log("Notifications marked as read successfully");
      } else {
        console.error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [notifications]);

  // Effect to handle dropdown open/close and automatic marking as read
  useEffect(() => {
    if (open && !hasMarkedAsReadRef.current) {
      // When dropdown opens, mark as read immediately
      markNotificationsAsRead();

      // Set timeout to update UI after 5 seconds (if needed for visual feedback)
      markAsReadTimeoutRef.current = setTimeout(() => {
        // Any additional UI updates after 5 seconds can go here
      }, 5000);
    } else {
      // When dropdown closes, clear the timeout if it exists
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
        markAsReadTimeoutRef.current = null;
      }
    }

    // Reset the flag when dropdown closes
    if (!open) {
      hasMarkedAsReadRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [open, markNotificationsAsRead]);

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
      case "create":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
      case "update":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
      case "delete":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
      case "created":
        return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Created</Badge>;
      case "warning":
      case "updated":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">Updated</Badge>;
      case "error":
      case "delete":
        return <Badge className="bg-red-500 hover:bg-red-600 text-xs">Error</Badge>;
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Info</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy · hh:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadNotificationIds = notifications
        .filter((notification) => !notification.notification.read)
        .map((notification) => notification._id);

      if (unreadNotificationIds.length === 0) {
        toast.info("All notifications are already read");
        return;
      }

      // Call API to mark all as read
      const response = await updateUserNotificationStatus({
        notificationIds: unreadNotificationIds,
        status: "read"
      });

      if (response && response.data && response.data.status) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            unreadNotificationIds.includes(notif._id)
              ? {
                  ...notif,
                  notification: {
                    ...notif.notification,
                    read: true
                  }
                }
              : notif
          )
        );
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setTotal(0);
    toast.success("All notifications cleared");
  };

  const NotificationSkeleton = () => (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full bg-border" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4 bg-border" />
            <Skeleton className="h-2 w-1/2 bg-border" />
            <Skeleton className="h-2 w-1/4 bg-border" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative">
      {/* Bell Button with Notification Count */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-hoverBg relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {notifications.filter((n) => !n.notification.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
            {notifications.filter((n) => !n.notification.read).length > 9
              ? "9+"
              : notifications.filter((n) => !n.notification.read).length}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <Card className="absolute right-0 mt-2 w-96 rounded-xl shadow-lg border bg-background z-50 max-h-[80vh] overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{total} total notifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-hoverBg">
                  {notifications.filter((n) => !n.notification.read).length} New
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            {notifications.length > 0 && (
              <div className="flex justify-between px-4 py-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={notifications.filter((n) => !n.notification.read).length === 0}
                >
                  Mark all as read
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                  Clear all
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                // Loading state
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <NotificationSkeleton key={i} />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                // Empty state
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New notifications will appear here
                  </p>
                </div>
              ) : (
                // Notifications list
                <div className="p-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification._id}
                      className={`mb-2 transition-colors ${
                        !notification.notification.read
                          ? "border-l-4 border-l-primary bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm leading-tight">
                                  {notification?.notification.title || "Notification"}
                                </p>
                                {getNotificationBadge(notification?.notification.type)}
                              </div>
                              {!notification.notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-2 leading-tight">
                              {notification.notification.message || "No message content"}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatTime(notification.notification.createdAt)}</span>
                              </div>

                              {/* Removed Mark read button */}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
