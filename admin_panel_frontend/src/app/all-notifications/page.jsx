"use client";
import { Navbar } from "@/components";
import { getAllNotification } from "@/services/notification/notificationServices";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Calendar, User, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CustomPagination } from "@/components/index"; // Import your CustomPagination component

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchNotifications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const response = await getAllNotification({
          page: page,
          limit: itemsPerPage
        });

        // console.log("Notifications API Response:", response);

        if (response && response.data && response.data.status) {
          const notificationsData = response.data.data.notifications || [];
          const pagination = response.data.data.pagination || {};

          setNotifications(notificationsData);
          setTotalNotifications(pagination.total || 0);
          setTotalPages(pagination.pages || 0);
          setCurrentPage(page);
        } else {
          toast.error("Failed to fetch notifications");
          // Fallback to empty array if API fails
          setNotifications([]);
          setTotalNotifications(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to fetch notifications");
        // Fallback to empty array on error
        setNotifications([]);
        setTotalNotifications(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  // Initial load
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy · hh:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "created":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "updated":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type?.toLowerCase()) {
      case "created":
        return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>;
      case "updated":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-500 hover:bg-red-600">Error</Badge>;
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // You'll need to implement this API call
      // await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, read: true } : notif))
      );

      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      // You'll need to implement this API call
      // await markAllNotificationsAsRead();

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const NotificationSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-10 w-10 rounded-full bg-border" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-border" />
            <Skeleton className="h-3 w-1/2 bg-border" />
            <Skeleton className="h-3 w-1/4 bg-border" />
          </div>
          <Skeleton className="h-5 w-16 bg-border" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="overflow-auto w-full">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-primary rounded-lg">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                Stay updated with your latest activities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {loading ? (
              <Skeleton className="h-6 w-20 bg-border rounded-md" />
            ) : totalNotifications > 0 ? (
              <Badge className="bg-hoverBg">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalNotifications)} of {totalNotifications}{" "}
                Notifications
              </Badge>
            ) : (
              <Badge className="bg-hoverBg">No Notifications Found</Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            // Initial loading skeleton
            Array.from({ length: itemsPerPage }).map((_, i) => <NotificationSkeleton key={i} />)
          ) : notifications.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You&apos;re all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Notifications list
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`transition-color`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">
                            {notification.title || "Notification"}
                          </p>
                          {getNotificationBadge(notification.type)}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message || "No message content"}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="justify-end"
            />
          </div>
        )}
      </div>
    </div>
  );
}
