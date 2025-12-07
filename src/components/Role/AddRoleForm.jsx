"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { navItems } from "@/lib/routes_variables";
import { save_role } from "@/services/roles/roleServices";
import { toast } from "sonner";
import { get_role } from "@/services/roles/roleServices";
import { useRouter } from "next/navigation";
export function AddRoleForm({ open, onOpenChange, onRoleCreated, roleId }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const [permissions, setPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (open && roleId) {
      // Fetch role data when editing
      fetchRoleData();
      setIsEditing(true);
    } else if (open) {
      // Reset for new role creation
      const initialPermissions = navItems.map((item) => ({
        id: item.id,
        page: item.label,
        read: false,
        edit: false,
        delete: false,
        download: false,
      }));
      setPermissions(initialPermissions);
      setIsEditing(false);
      reset();
    }
  }, [open, roleId]);

  const fetchRoleData = async () => {
    try {
      const response = await get_role(roleId,router);
      if (response.data.status) {
        const roleData = response.data.data;

        // Set form values
        setValue("roleName", roleData.role.name);
        setValue("description", roleData.role.description || "");

        // Set permissions
        const formattedPermissions = navItems.map((item) => {
          const existingPermission = roleData.permissions.find(
            (p) => p.page === item.id
          );

          return {
            id: item.id,
            page: item.label,
            read: existingPermission?.read || false,
            edit: existingPermission?.edit || false,
            delete: existingPermission?.delete || false,
            download: existingPermission?.download || false,
          };
        });

        setPermissions(formattedPermissions);
      }
    } catch (error) {
      console.error("Error fetching role data:", error);
      toast.error("Failed to load role data");
    }
  };

  const handlePermissionToggle = (id, permissionType) => {
    setPermissions(
      permissions.map((permission) =>
        permission.id === id
          ? { ...permission, [permissionType]: !permission[permissionType] }
          : permission
      )
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        role_name: data.roleName,
        description: data.description,
        permissions: permissions.map((p) => ({
          page: p.id,
          read: p.read,
          edit: p.edit,
          delete: p.delete,
          download: p.download,
        })),
      };

      // For updates, include role_id in the request body
      if (isEditing) {
        formattedData.role_id = roleId;
      }

      await save_role(formattedData,router);
      toast.success(
        isEditing ? "Role updated successfully!" : "Role saved successfully!"
      );

      if (onRoleCreated) {
        onRoleCreated();
      }
      onOpenChange(false);
      reset();
      setPermissions([]);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    setPermissions([]);
  };

  return (
    <Dialog className="" open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <DialogContent className=" max-w-4xl bg-cardBg h-[calc(100vh-5rem)] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-text">
            {isEditing ? "Edit Role" : "Add New Role"}
          </DialogTitle>
          <DialogDescription className="text-text">
            {isEditing
              ? "Edit the role and update permissions."
              : "Create a new role and set permissions for different pages."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-6 px-4"
        >
          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="role-name ">
              Role Name
            </Label>
            <Input
              id="role-name"
              {...register("roleName", {
                required: "Role name is required",
                minLength: {
                  value: 3,
                  message: "Role name must be at least 3 characters",
                },
              })}
              placeholder="Enter role name"
              className="text-text bg-cardBg border-border"
            />
            {errors.roleName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.roleName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="description ">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Enter description"
              {...register("description")}
              className="text-text bg-cardBg border-border"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text">Permissions</h3>

            <div className="rounded-md border">
              <Table className="text-text">
                <TableHeader className="bg-hoverBg">
                  <TableRow>
                    <TableHead className="w-[200px]">Page Name</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead>Edit</TableHead>
                    <TableHead>Delete</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {permission.page}
                      </TableCell>
                      {["read", "edit", "delete", "download"].map((action) => (
                        <TableCell key={action}>
                          <Switch
                            checked={permission[action]}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.id, action)
                            }
                            className="bg-bgSwitch"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              className="text-text"
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button className="text-text" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : isEditing
                ? "Update Role"
                : "Save Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
