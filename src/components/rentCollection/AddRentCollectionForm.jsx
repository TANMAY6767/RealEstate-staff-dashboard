// components/dashboard/rentCollection/AddRentCollectionForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Search, 
  X, 
  FileImage, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { 
  createRentCollection,
  getRentCollection,
  getPropertiesForRent 
} from "@/services/rentCollection/rentCollectionServices";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddRentCollectionForm({ open, onOpenChange, onRecordCreated, recordId }) {
  const { register, handleSubmit, setValue, reset, control, watch, formState: { errors } } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const response = await getPropertiesForRent();
        console.log("Properties response:", response);
        if (response?.data?.status) {
          // Adjust based on your API response structure
          const propertiesData = response.data.data?.data || response.data.data || [];
          setProperties(propertiesData);
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
      property.owner_name?.toLowerCase().includes(query) ||
      property.owner_email?.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  useEffect(() => {
    if (open && recordId) {
      setIsEditing(true);
      const fetchRecordData = async () => {
        try {
          const response = await getRentCollection(recordId);
          if (response?.data?.status) {
            const record = response.data.data.rentCollection;
            
            // Set form values
            setValue("property_id", record.property_id?._id || "");
            setValue("tenant_name", record.tenant_name);
            setValue("tenant_email", record.tenant_email);
            setValue("tenant_phone", record.tenant_phone || "");
            setValue("month", record.month);
            setValue("year", record.year.toString());
            setValue("rent_amount", record.rent_amount);
            setValue("paid_amount", record.paid_amount);
            setValue("due_date", record.due_date ? new Date(record.due_date).toISOString().split('T')[0] : "");
            setValue("payment_method", record.payment_method);
            setValue("transaction_id", record.transaction_id || "");
            setValue("receipt_number", record.receipt_number || "");
            setValue("notes", record.notes || "");
            
            setSelectedPropertyId(record.property_id?._id || "");
            
            if (record.payment_proof) {
              setPreviewUrl(record.payment_proof);
            }
          }
        } catch (error) {
          console.error("Error fetching rent record:", error);
          toast.error("Failed to fetch rent record data");
        }
      };
      fetchRecordData();
    } else if (open) {
      reset({
        property_id: "",
        tenant_name: "",
        tenant_email: "",
        tenant_phone: "",
        month: months[new Date().getMonth()],
        year: currentYear.toString(),
        rent_amount: "",
        paid_amount: "",
        due_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        transaction_id: "",
        receipt_number: "",
        notes: ""
      });
      setPaymentProofFile(null);
      setPreviewUrl(null);
      setSelectedPropertyId("");
      setSearchQuery("");
      setIsEditing(false);
    }
  }, [open, recordId, setValue, reset]);

  const onSubmit = async (data) => {
    // Validation
    if (parseFloat(data.paid_amount) > parseFloat(data.rent_amount)) {
      toast.error("Paid amount cannot exceed rent amount");
      return;
    }

    if (!data.property_id) {
      toast.error("Please select a property");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      // Append payment proof if exists
      if (paymentProofFile) {
        formData.append("payment_proof", paymentProofFile);
      }

      const response = await createRentCollection(formData);
      if (response?.data?.status) {
        toast.success(isEditing ? "Rent record updated!" : "Rent record added!");
        onRecordCreated();
        onOpenChange(false);
        reset();
        setPaymentProofFile(null);
        setPreviewUrl(null);
        setSelectedPropertyId("");
        setSearchQuery("");
      } else {
        toast.error(response?.data?.message || "Failed to save rent record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save rent record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProperty = properties.find(prop => prop._id === selectedPropertyId || prop.value === selectedPropertyId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <DialogContent className="max-w-3xl bg-cardBg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Rent Collection" : "Add Rent Collection Record"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit rent collection details." : "Add a new rent collection record for a property."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property_id">Property *</Label>
            {loadingProperties ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading properties...
              </div>
            ) : (
              <Controller
                name="property_id"
                control={control}
                rules={{ required: "Property is required" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search properties..."
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
                            {filteredProperties.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                {searchQuery ? "No properties found" : "No properties available"}
                              </div>
                            ) : (
                              <div className="py-1">
                                {filteredProperties.map((property) => (
                                  <div
                                    key={property._id || property.value}
                                    className={`px-3 py-2 cursor-pointer hover:bg-accent ${selectedPropertyId === (property._id || property.value) ? 'bg-accent' : ''}`}
                                    onClick={() => {
                                      const id = property._id || property.value;
                                      field.onChange(id);
                                      setSelectedPropertyId(id);
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
                                          <p className="truncate">👤 {property.owner_name || property.owner_email}</p>
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
            )}

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
                      <p>👤 Owner: {selectedProperty.owner_name || selectedProperty.owner_email}</p>
                      {selectedProperty.price && (
                        <p>💰 Monthly Rent: ${selectedProperty.price}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPropertyId("");
                      setValue("property_id", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tenant Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">
                <User className="h-4 w-4 inline mr-1" />
                Tenant Name *
              </Label>
              <Input
                id="tenant_name"
                {...register("tenant_name", { 
                  required: "Tenant name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
                placeholder="Enter tenant name"
              />
              {errors.tenant_name && (
                <p className="text-sm text-destructive">{errors.tenant_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_email">
                <Mail className="h-4 w-4 inline mr-1" />
                Tenant Email *
              </Label>
              <Input
                id="tenant_email"
                type="email"
                {...register("tenant_email", { 
                  required: "Tenant email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="tenant@example.com"
              />
              {errors.tenant_email && (
                <p className="text-sm text-destructive">{errors.tenant_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_phone">
                <Phone className="h-4 w-4 inline mr-1" />
                Tenant Phone
              </Label>
              <Input
                id="tenant_phone"
                {...register("tenant_phone")}
                placeholder="+1 (123) 456-7890"
              />
            </div>
          </div>

          {/* Rent Period and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Controller
                name="month"
                control={control}
                rules={{ required: "Month is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.month && (
                <p className="text-sm text-destructive">{errors.month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Controller
                name="year"
                control={control}
                rules={{ required: "Year is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent_amount">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Rent Amount *
              </Label>
              <Input
                id="rent_amount"
                type="number"
                step="0.01"
                {...register("rent_amount", { 
                  required: "Rent amount is required",
                  min: { value: 0.01, message: "Rent amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.rent_amount && (
                <p className="text-sm text-destructive">{errors.rent_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Paid Amount *
              </Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                {...register("paid_amount", { 
                  required: "Paid amount is required",
                  min: { value: 0, message: "Paid amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.paid_amount && (
                <p className="text-sm text-destructive">{errors.paid_amount.message}</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date *
              </Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date", { required: "Due date is required" })}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive">{errors.due_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Controller
                name="payment_method"
                control={control}
                defaultValue="cash"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">
                <FileText className="h-4 w-4 inline mr-1" />
                Receipt Number
              </Label>
              <Input
                id="receipt_number"
                {...register("receipt_number")}
                placeholder="RC-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction ID</Label>
            <Input
              id="transaction_id"
              {...register("transaction_id")}
              placeholder="TXN123456789"
            />
          </div>

          {/* Payment Proof Upload */}
          <div className="space-y-2">
            <Label>
              <FileImage className="h-4 w-4 inline mr-1" />
              Payment Proof (Optional)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPaymentProofFile(file);
                    if (file.type.startsWith('image/')) {
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }
                }}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload payment receipt or proof (image or PDF)
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
                      setPaymentProofFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {previewUrl.includes('.pdf') ? (
                  <div className="bg-gray-100 p-4 rounded-md text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="text-sm mt-2">PDF Document</p>
                  </div>
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Payment proof preview" 
                    className="h-32 object-contain rounded-md mx-auto"
                  />
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              {...register("notes")} 
              placeholder="Any additional notes or comments..."
              className="min-h-[80px]"
            />
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
              disabled={isSubmitting || !watch("property_id")}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isEditing ? (
                "Update Record"
              ) : (
                "Add Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}