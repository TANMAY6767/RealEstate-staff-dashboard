"use client";
import { SecondaryHeader } from "..";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { SquarePen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { CustomPagination } from "..";
import { Badge } from "../ui/badge";
import { AddOrUpdateUserForm } from "./AddOrUpdateUserForm";
import React, { useState, useEffect, useCallback } from "react";
import { getAllUsers, deleteUser } from "@/services/user/userServices";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { ConfirmDialog } from "@/components/custom_ui/confirm-dialog";
import { toast } from "sonner";
import SearchLoader from "@/components/custom_ui/SearchLoader"; // Import the SearchLoader
import { useRouter } from "next/navigation";
import { CrudDetailsHoverCard } from "..";
import { checkPermission } from "@/helper/commonHelper";

export function UserSection({ isExpanded }) {
  const [add_or_update_user, set_add_or_update_user] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // Add this state
  const [isInitial, setIsInitial] = useState(true);
  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    try {
      setIsSearching(isInitial == false ? true : false); // Set isSearching based on whether there's a search term

      const payload = {
        search: debouncedSearchTerm,
        limit: itemsPerPage,
        page: currentPage
      };
      const response = await getAllUsers(payload, router);
      console.log(response, "foiewjfoij");
      if (response.data.status) {
        setUsers(response.data.data.users);
        const pagination_data = response.data.data.pagination;
        setItemsPerPage(pagination_data.itemsPerPage);
        setTotalUsers(pagination_data.totalUsers);
        setCurrentPage(pagination_data.currentPage);
        setTotalPages(pagination_data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsSearching(false); // Reset isSearching after fetch completes
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    setLoading(isInitial == true ? true : false);
    fetchUsers();
    setIsInitial(false);
  }, [fetchUsers]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditUser = (userId) => {
    if (!checkPermission("users", "edit")) {
      toast.error("You don't have permission to edit users");
      return;
    }
    setCurrentUserId(userId);
    set_add_or_update_user(true);
  };

  const handleAddUser = () => {
    if (!checkPermission("users", "edit")) {
      toast.error("You don't have permission to create users");
      return;
    }
    setCurrentUserId(null);
    set_add_or_update_user(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!checkPermission("users", "delete")) {
      toast.error("You don't have permission to delete users");
      return;
    }
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteUser(userToDelete, router);
      if (response.data.status) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to generate random light color
  const getRandomLightColor = () => {
    const lightColors = [
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800",
      "bg-orange-100 text-orange-800",
      "bg-cyan-100 text-cyan-800",
      "bg-amber-100 text-amber-800"
    ];
    return lightColors[Math.floor(Math.random() * lightColors.length)];
  };

  const getRoleBadgeClass = (roleName) => {
    if (roleName?.toLowerCase() === "super user") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return getRandomLightColor();
  };

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-10 w-10 rounded-full bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
    </TableRow>
  ));

  // Check permissions for UI elements
  const canCreateUser = checkPermission("users", "edit");
  const canEditUser = checkPermission("users", "edit");
  const canDeleteUser = checkPermission("users", "delete");

  return (
    <div className="w-full h-full">
      <SecondaryHeader
        title="Users"
        searchPlaceholder="Search Users"
        buttonText="Add New User"
        tooltipText="Add New User"
        onButtonClick={handleAddUser}
        onMobileButtonClick={handleAddUser}
        onSearch={handleSearch}
        showButton={canCreateUser} // Only show button if user has create permission
      />

      {/* Show search loader when searching */}
      {isSearching && <SearchLoader />}

      <>
        <div className="px-1 flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-5 w-40 bg-border rounded-md" />
            ) : totalUsers > 0 ? (
              <Badge className="bg-hoverBg">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} Users
              </Badge>
            ) : (
              <Badge className="bg-hoverBg">No Users Found</Badge>
            )}
          </div>
        </div>

        <div className="mx-1 mt-6 rounded-md max-w-[99vw] border overflow-x-auto bg-tableBg">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableCaption className="mb-2">A list of system users</TableCaption>
            <TableHeader className="bg-hoverBg">
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[250px]">Email</TableHead>
                <TableHead className="w-[150px]">Role</TableHead>
                <TableHead className="w-[180px] text-center">History</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? skeletonRows
                : users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeClass(user.role?.name)}>
                          {user.role?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <CrudDetailsHoverCard car={user}></CrudDetailsHoverCard>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {canEditUser && (
                            <Button
                              onClick={() => handleEditUser(user._id)}
                              variant="ghost"
                              size="icon"
                            >
                              <SquarePen className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteUser && (
                            <Button
                              onClick={() => handleDeleteUser(user._id)}
                              variant="ghost"
                              size="icon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Show message if no action permissions */}
                          {!canEditUser && !canDeleteUser && (
                            <span className="text-xs text-muted-foreground">No actions</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="justify-end"
            />
          </div>
        )}
      </>
      {add_or_update_user && (
        <AddOrUpdateUserForm
          open={add_or_update_user}
          onOpenChange={set_add_or_update_user}
          onUserCreated={fetchUsers}
          userId={currentUserId}
        />
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
