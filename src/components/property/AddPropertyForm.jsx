"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createOrUpdateProperty } from "@/services/property/propertyServices";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichTextEditor } from "..";
import Image from "next/image";
import { X, Upload, Plus } from "lucide-react";

export function AddCarForm({ open, onOpenChange, onCarCreated, carData }) {
  const methods = useForm({
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      postalCode: 0,
      price: 0,
      owner_email: "",
      owner_name: "",
      status: "available",
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
    watch
  } = methods;

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("car");
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const router = useRouter();

  const status = watch("status");
  // const websiteState = watch("website_state");

  useEffect(() => {
    if (open && carData) {
      setIsEditing(true);
      // Set form values from the passed carData
      setValue("title", carData.title || "");
      setValue("description", carData.description || "");
      setValue("address", carData.address || "");
      setValue("city", carData.city || "");
      setValue("postalCode", carData.postalCode || 0);
      setValue("price", carData.price || 0);
      setValue("owner_email", carData.owner_email || "");
      setValue("owner_name", carData.owner_name || "");
      setValue("status", carData.status || "available");
      // setValue("website_state", carData.website_state || true);

      // Set images if they exist
      if (carData.main_image) {
        setMainImagePreview(carData.main_image);
      }

      if (carData.images && carData.images.length > 0) {
        setExistingImages(carData.images);
      }

      // Set details if they exist
      if (carData.details) {
        Object.keys(carData.details).forEach((key) => {
          setValue(`details.${key}`, carData.details[key] || "");
        });
      }

      // Set moreInfo if it exists
      if (carData.moreInfo) {
        Object.keys(carData.moreInfo).forEach((key) => {
          setValue(`moreInfo.${key}`, carData.moreInfo[key] || "");
        });
      }
    } else if (open) {
      // Reset for new car creation
      reset({
        title: "",
        description: "",
        address: "",
        city: "",
        postalCode: 0,
        price: 0,
        owner_email: "",
        owner_name: "",
        status: "available",
        // website_state: true,


      });
      setMainImageFile(null);
      setMainImagePreview(null);
      setAdditionalImageFiles([]);
      setAdditionalImagePreviews([]);
      setExistingImages([]);
      setIsEditing(false);
      setActiveTab("car");
    }
  }, [open, carData, setValue, reset]);

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...additionalImageFiles];
      const newPreviews = [...additionalImagePreviews];

      files.forEach((file) => {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setAdditionalImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });

      setAdditionalImageFiles(newFiles);
    }
  };

  const removeAdditionalImage = (index) => {
    const newFiles = [...additionalImageFiles];
    const newPreviews = [...additionalImagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setAdditionalImageFiles(newFiles);
    setAdditionalImagePreviews(newPreviews);
  };

  const removeExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Append all non-file fields
      
      if (carData?._id) {
  formData.append("property_id", carData._id);   // ← key renamed
}

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("postalCode", data.postalCode);
      formData.append("price", data.price);
      formData.append("owner_email", data.owner_email);
      formData.append("owner_name", data.owner_name);
      formData.append("status", data.status === (true || false) ? "unsold" : data.status);
      // formData.append("website_state", data.website_state);

      // Append details
      if (data.details && typeof data.details === 'object') {
  Object.keys(data.details).forEach((key) => {
    formData.append(key, data.details[key]);
  });
}


      // Append moreInfo
      if (data.moreInfo && typeof data.moreInfo === 'object') {
  Object.keys(data.moreInfo).forEach((key) => {
    if (key === 'duty') {                 // keep your old special-case
      formData.append('duty_more', data.moreInfo[key]);
    } else {
      formData.append(key, data.moreInfo[key]);
    }
  });
}

      // Append main image if selected
      if (mainImageFile) {
        formData.append("main_image", mainImageFile);
      }

      // Append additional images
      additionalImageFiles.forEach((file) => {
        formData.append("other_images", file);
      });

      // Call the API with FormData
      const response = await createOrUpdateProperty(formData, router);

      if (response && response.data && response.data.status) {
        toast.success(isEditing ? "Car updated successfully!" : "Car added successfully!");
        if (onCarCreated) {
          onCarCreated();
        }
        onOpenChange(false);
        reset();
      } else {
        toast.error(response?.data?.message || "Failed to save car");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save car");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    setMainImageFile(null);
    setMainImagePreview(null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setExistingImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-text sm:max-w-3xl max-h-[90vh] bg-cardBg flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Car" : "Add New Car"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the car information below."
              : "Fill in the details to add a new car to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col flex-1 min-h-0"
          >
            {/* Fixed Tabs Header */}
            <TabsList className="grid grid-cols-3 gap-2 mb-4 flex-shrink-0 bg-cardBg">
              <TabsTrigger value="car">Car Information</TabsTrigger>
              {/* <TabsTrigger value="details">Car Details</TabsTrigger>
              <TabsTrigger value="moreInfo">More Information</TabsTrigger> */}
            </TabsList>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
              <TabsContent value="car" className="space-y-4 h-full">
                <div className="grid grid-cols-2 gap-4">
                  {/* 1.  Title  */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register("title", { required: "Title is required" })}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* 2.  Address  */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      {...register("address", { required: "Address is required" })}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                {/* 3.  Description  */}
                <RichTextEditor name="description" label="Description" />

                {/* 4.  Main Image  */}
                <div className="space-y-2">
                  <Label>Main Image</Label>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="main_image"
                      className="flex flex-col items-center justify-center w-56 h-40 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/10 transition-colors"
                    >
                      {mainImagePreview ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={mainImagePreview}
                            alt="Main car image"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Upload</span>
                        </div>
                      )}
                      <input
                        id="main_image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* 5.  Additional Images  */}
                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <div className="w-full h-32 relative rounded-md overflow-hidden">
                          <Image
                            src={img.image_url || img}
                            alt={`existing ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {additionalImagePreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative group">
                        <div className="w-full h-32 relative rounded-md overflow-hidden">
                          <Image
                            src={preview}
                            alt={`new ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <label
                      htmlFor="images"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent/10 transition-colors"
                    >
                      <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add Image</span>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* 6-11.  City / Postal / Price / Emails  */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city", { required: "City is required" })} />
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      type="number"
                      {...register("postalCode", {
                        required: "Postal code is required",
                        min: { value: 0, message: "Must be positive" }
                      })}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-500">{errors.postalCode.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", {
                        required: "Price is required",
                        min: { value: 0, message: "Must be positive" }
                      })}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Owner E-mail</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      {...register("owner_email", { required: "Owner email is required" })}
                    />
                    {errors.owner_email && (
                      <p className="text-sm text-red-500">{errors.owner_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      {...register("owner_name", { required: "Owner name is required" })}
                    />
                    {errors.owner_name && (
                      <p className="text-sm text-red-500">{errors.owner_name.message}</p>
                    )}
                  </div>

                  {/* 12.  Status  */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Property Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="border rounded p-1 bg-gray-100 cursor-pointer"
                        >
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="sold">Sold</option>
                          {/* <option value="pending">Pending</option> */}
                        </select>
                      )}
                    />
                  </div>
                </div>

                {/* sticky footer buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border sticky bottom-0 bg-cardBg">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : isEditing ? "Update Property" : "Add Property"}
                  </Button>
                </div>
              </TabsContent>





              
            </form>
          </Tabs>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}