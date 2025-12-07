// components/dashboard/tenantQ/AddTenantQForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building, Search, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateTenantQ, getTenantQ, getPropertysForDropdown } from "@/services/tenantq/tenantQServices";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddTenantQForm({ open, onOpenChange, onTenantQCreated, tenantQId }) {
  const { register, handleSubmit, setValue, reset, control, watch } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

// In AddTenantQForm.jsx - update the fetchProperties function
useEffect(() => {
  const fetchProperties = async () => {
  setLoadingProperties(true);
  try {
    const response = await getPropertysForDropdown();
    
    // Try different response structures
    const propertiesData = 
      response?.data?.data?.data || 
      response?.data?.data?.properties || 
      response?.data?.data || 
      [];
    
    setProperties(propertiesData);
    
    if (propertiesData.length === 0) {
      toast.warning("No properties found");
    }
  } catch (error) {
    console.error("Error fetching properties:", error);
    toast.error("Failed to fetch properties");
  } finally {
    setLoadingProperties(false);
  }
};

  if (open) {
    fetchProperties();
  }
}, [open]);

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    
    const query = searchQuery.toLowerCase();
    return properties.filter(property => 
      property.title?.toLowerCase().includes(query) ||
      property.address?.toLowerCase().includes(query) ||
      property.owner_email?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  useEffect(() => {
    if (open && tenantQId) {
      setIsEditing(true);
      const fetchTenantQData = async () => {
        try {
          const response = await getTenantQ(tenantQId);
          if (response?.data?.status) {
            const tenantQ = response.data.data;
            setValue("Tenant_property", tenantQ.Tenant_property?._id || "");
            setValue("Testimonial", tenantQ.Testimonial);
            setValue("Status", tenantQ.Status);
            setSelectedPropertyId(tenantQ.Tenant_property?._id || "");
            setPreviewUrl(tenantQ.image);
          }
        } catch (error) {
          toast.error("Failed to fetch tenant query data");
        }
      };
      fetchTenantQData();
    } else if (open) {
      reset({
        Tenant_property: "",
        Testimonial: "",
        Status: "pending"
      });
      setImageFile(null);
      setPreviewUrl(null);
      setSelectedPropertyId("");
      setSearchQuery("");
      setIsEditing(false);
    }
  }, [open, tenantQId, setValue, reset]);

  const onSubmit = async (data) => {
    if (!data.Tenant_property) {
      toast.error("Please select a property");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tenant_id", tenantQId || "");
      formData.append("Tenant_property", data.Tenant_property);
      formData.append("Testimonial", data.Testimonial);
      formData.append("Status", data.Status);
      if (imageFile) formData.append("image", imageFile);

      const response = await createOrUpdateTenantQ(formData);
      if (response?.data?.status) {
        toast.success(isEditing ? "Tenant query updated!" : "Tenant query added!");
        onTenantQCreated();
        onOpenChange(false);
        reset();
        setImageFile(null);
        setPreviewUrl(null);
        setSelectedPropertyId("");
        setSearchQuery("");
      } else {
        toast.error(response?.data?.message || "Failed to save tenant query");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save tenant query");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProperty = properties.find(prop => prop.value === selectedPropertyId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <DialogContent className="max-w-3xl bg-cardBg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tenant Query" : "Add New Tenant Query"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit tenant query details." : "Add a new tenant query for a property."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Property Selection with Search */}
          <div className="space-y-2 relative">
            <Label htmlFor="Tenant_property">Property *</Label>
            
            <Controller
              name="Tenant_property"
              control={control}
              rules={{ required: "Property is required" }}
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search properties by title, address, or owner email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setDropdownOpen(true)}
                          className="pl-10 pr-10"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        Browse
                      </Button>
                    </div>

                    {/* Dropdown with search results */}
                    {dropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
                        <ScrollArea className="h-64">
                          {loadingProperties ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                              <p className="text-sm text-muted-foreground mt-2">Loading properties...</p>
                            </div>
                          ) : filteredProperties.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              {searchQuery ? "No properties found" : "No properties available"}
                            </div>
                          ) : (
                            <div className="py-1">
                              {filteredProperties.map((property) => (
                                <div
                                  key={property.value}
                                  className={`px-3 py-2 cursor-pointer hover:bg-accent ${selectedPropertyId === property.value ? 'bg-accent' : ''}`}
                                  onClick={() => {
                                    field.onChange(property.value);
                                    setSelectedPropertyId(property.value);
                                    setDropdownOpen(false);
                                    setSearchQuery("");
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    <Building className="h-4 w-4 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{property.title}</p>
                                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                                        <p className="truncate">📍 {property.address}</p>
                                        <p className="truncate">👤 {property.owner_email}</p>
                                        {property.city && (
                                          <p className="truncate">🏙️ {property.city}</p>
                                        )}
                                        {property.price && (
                                          <p className="truncate">💰 ${property.price}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="ml-2 flex-shrink-0">
                                      Select
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error.message}</p>
                  )}
                  <input type="hidden" {...field} />
                </div>
              )}
            />

            {/* Selected Property Display */}
            {selectedProperty && (
              <div className="mt-3 p-3 border rounded-md bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedProperty.title}</p>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <p>📍 {selectedProperty.address}</p>
                      <p>👤 {selectedProperty.owner_email}</p>
                      {selectedProperty.city && (
                        <p>🏙️ {selectedProperty.city}</p>
                      )}
                      {selectedProperty.price && (
                        <p>💰 ${selectedProperty.price}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPropertyId("");
                      setValue("Tenant_property", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Testimonial/Query */}
          <div className="space-y-2">
            <Label>Query Details *</Label>
            <Textarea 
              {...register("Testimonial", { 
                required: "Query details are required",
                validate: value => value.trim().length > 0 || "Query cannot be empty"
              })} 
              placeholder="Enter tenant query, issue, or testimonial..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe the tenant's query or issue in detail
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              name="Status"
              control={control}
              defaultValue="pending"
              render={({ field }) => (
                <div className="flex gap-2">
                  {["pending", "resolved", "draft"].map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={field.value === status ? "default" : "outline"}
                      onClick={() => field.onChange(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Attachment Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload an image related to the query (e.g., damage photo, issue screenshot)
            </p>
            {previewUrl && (
              <div className="mt-2 p-2 border rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm">Preview:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-32 object-contain rounded-md mx-auto"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !watch("Tenant_property")}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isEditing ? (
                "Update Query"
              ) : (
                "Add Query"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}