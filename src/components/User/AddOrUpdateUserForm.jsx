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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { get_all_roles } from "@/services/roles/roleServices";
import { createOrUpdateUser, getUser } from "@/services/user/userServices";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react"; // Add eye icons
import { useRouter } from "next/navigation";

export function AddOrUpdateUserForm({
  open,
  onOpenChange,
  onUserCreated,
  userId,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm();
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Add visibility state
  const router = useRouter();
  useEffect(() => {
    if (open) {
      fetchRoles();
      if (userId) {
        fetchUserData();
        setIsEditing(true);
      } else {
        setIsEditing(false);
        reset();
      }
    }
  }, [open, userId]);

  const fetchRoles = async () => {
    try {
      const response = await get_all_roles({ limit: 100, page: 1 },router);
      if (response.data.status) {
        setRoles(response.data.data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await getUser(userId,router);
      if (response.data.status) {
        const userData = response.data.data;
        setValue("name", userData.name);
        setValue("email", userData.email);
        setValue("role", String(userData.role._id));
        setValue("image", userData.image || "");
        setValue("password", userData.password);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("fwoeihfio");
    try {
      const formattedData = {
        name: data.name,
        email: data.email,
        role: data.role,
        image: data.image || null,
        password: data.password,
      };

      // For new users, include password
      // if (!isEditing) {
      formattedData.password = data.password;
      // }

      // For updates, include user_id
      if (isEditing) {
        formattedData.user_id = userId;
      }

      await createOrUpdateUser(formattedData,router);
      toast.success(
        isEditing ? "User updated successfully!" : "User created successfully!"
      );

      if (onUserCreated) {
        onUserCreated();
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog className="" open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <DialogContent className="max-w-2xl bg-cardBg">
        <DialogHeader>
          <DialogTitle className="text-text">
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription className="text-text">
            {isEditing
              ? "Edit the user details."
              : "Create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="name">
              Full Name
            </Label>
            <Input
              id="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              placeholder="Enter full name"
              className="text-text bg-cardBg border-border"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter email address"
              className="text-text bg-cardBg border-border"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field - Always Visible */}
          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="password">
              Password {isEditing && "(Leave blank to keep current)"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter password"
                className="text-text bg-cardBg border-border pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="role">
              Role
            </Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="text-text bg-cardBg border-border">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className={"bg-cardBg text-text"}>
                    {roles.map((role) => (
                      <SelectItem
                        className={"hover:text-heading hover:bg-secondaryBg"}
                        key={role._id}
                        value={role._id}
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={"text-text"} htmlFor="image">
              Profile Image URL (Optional)
            </Label>
            <Input
              id="image"
              {...register("image")}
              placeholder="Enter image URL"
              className="text-text bg-cardBg border-border"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
                ? "Update User"
                : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
