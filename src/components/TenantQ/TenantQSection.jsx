// components/dashboard/tenantQ/TenantQSection.jsx
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
import { getAllTenantQs, deleteTenantQ, updateTenantQStatus } from "@/services/tenantq/tenantQServices";
import { SquarePen, Trash2, Building, Calendar, CheckCircle, Clock, MapPin, User } from "lucide-react";
import { Button } from "../ui/button";
import { CustomPagination } from "..";
import { Badge } from "../ui/badge";
import { AddTenantQForm } from "./AddTenantQForm";
import React, { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import SearchLoader from "@/components/custom_ui/SearchLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CrudDetailsHoverCard } from "..";
import { checkPermission } from "@/helper/commonHelper";

/* ----- shadcn dialog imports ----- */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function TenantQSection({ isExpanded }) {
  const [add_or_update_tenantQ, set_add_or_update_tenantQ] = useState(false);
  const [currentTenantQId, setCurrentTenantQId] = useState(null);
  const [tenantQs, setTenantQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTenantQs, setTotalTenantQs] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [detailTenantQ, setDetailTenantQ] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTenantQs = useCallback(async () => {
    try {
      setIsSearching(isInitial === false);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        ...(statusFilter !== "all" && { status: statusFilter })
      };

      const response = await getAllTenantQs(params);
      
      if (response && response.data && response.data.status) {
        const data = response.data.data;
        const tenantQueries = data.tenantQueries || data;
        
       
        setTenantQs(tenantQueries);
        setTotalTenantQs(data.pagination?.total || data.length || 0);
        setTotalPages(data.pagination?.totalPages || 
          Math.ceil((data.pagination?.total || data.length) / itemsPerPage));
      } else {
        setTenantQs([]);
        setTotalTenantQs(0);
        setTotalPages(0);
        toast.error("Failed to fetch tenant queries");
      }

      setLoading(false);
      setIsSearching(false);
    } catch (error) {
      console.error("Error fetching tenant queries:", error);
      setTenantQs([]);
      setTotalTenantQs(0);
      setTotalPages(0);
      setLoading(false);
      setIsSearching(false);
      toast.error("Failed to fetch tenant queries");
    }
  }, [debouncedSearchTerm, currentPage, itemsPerPage, isInitial, statusFilter]);

  useEffect(() => {
    setLoading(isInitial === true);
    fetchTenantQs();
    setIsInitial(false);
  }, [fetchTenantQs]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Invalid Date";
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return "Date Error";
    }
  };

  const formatAddress = (property) => {
    if (!property) return "No property details";
    
    const addressParts = [];
    if (property.address) addressParts.push(property.address);
    if (property.city) addressParts.push(property.city);
    if (property.postalCode) addressParts.push(property.postalCode);
    
    return addressParts.length > 0 ? addressParts.join(", ") : "Address not available";
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return "N/A";
    }
  };

  /* ----- detail modal helpers ----- */
  const openDetail = (tenantQ) => {
    console.log("Opening detail for:", tenantQ);
    setDetailTenantQ(tenantQ);
  };
  
  const closeDetail = () => setDetailTenantQ(null);

  const markResolved = async () => {
    if (!detailTenantQ) return;
    try {
      await updateTenantQStatus(detailTenantQ._id, { Status: "resolved" });
      toast.success("Tenant query marked as resolved");
      closeDetail();
      fetchTenantQs();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Could not update status");
    }
  };

  const handleEditTenantQ = (tenantQId) => {
    if (!checkPermission("tenantq", "edit")) {
      toast.error("You don't have permission to edit tenant queries");
      return;
    }
    setCurrentTenantQId(tenantQId);
    set_add_or_update_tenantQ(true);
  };

  const handleAddTenantQ = () => {
    if (!checkPermission("tenantq", "edit")) {
      toast.error("You don't have permission to add tenant queries");
      return;
    }
    setCurrentTenantQId(null);
    set_add_or_update_tenantQ(true);
  };

  const handleDeleteTenantQ = async (tenantQId) => {
    if (!checkPermission("tenantq", "delete")) {
      toast.error("You don't have permission to delete tenant queries");
      return;
    }

    try {
      const response = await deleteTenantQ(tenantQId);
      if (response && response.data && response.data.status) {
        toast.success("Tenant query deleted successfully");
        fetchTenantQs();
      } else {
        toast.error("Failed to delete tenant query");
      }
    } catch (error) {
      console.error("Error deleting tenant query:", error);
      toast.error("Failed to delete tenant query");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const variants = {
      resolved: "bg-green-500 hover:bg-green-600",
      pending: "bg-yellow-500 hover:bg-yellow-600",
      draft: "bg-gray-500 hover:bg-gray-600"
    };
    
    return (
      <Badge className={`${variants[status] || "bg-gray-500"} text-white`}>
        {status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === "pending" && <Clock className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-border" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-border" />
            <Skeleton className="h-3 w-20 bg-border" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <div className="w-full h-full">
      {isSearching && <SearchLoader />}
      <SecondaryHeader
        title="Tenant Queries"
        searchPlaceholder="Search queries or properties..."
        buttonText="Add New Query"
        tooltipText="Add New Tenant Query"
        onButtonClick={handleAddTenantQ}
        onMobileButtonClick={handleAddTenantQ}
        onSearch={handleSearch}
      />
      
      {/* Status Filter Tabs */}
      <div className="px-1 mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex space-x-2 border-b">
            {["all", "pending", "resolved", "draft"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status === "all" ? "All Queries" : 
                 status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-1 bg-muted rounded-full px-2 py-0.5 text-xs">
                    {tenantQs.filter(t => t.Status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground ml-auto">
            {loading ? (
              <Skeleton className="h-5 w-40 bg-border rounded-md" />
            ) : totalTenantQs > 0 ? (
              <Badge className="bg-hoverBg">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalTenantQs)} of {totalTenantQs} 
                {statusFilter !== "all" ? ` ${statusFilter} queries` : " queries"}
              </Badge>
            ) : (
              <Badge className="bg-hoverBg">No Tenant Queries Found</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-1 mt-6 rounded-md max-w-[99vw] border overflow-x-auto bg-tableBg">
        <Table className="min-w-[1000px] lg:min-w-full">
          <TableCaption className="mb-2">A list of tenant queries and issues</TableCaption>
          <TableHeader className="bg-hoverBg">
            <TableRow>
              <TableHead className="w-[150px]">Property</TableHead>
              <TableHead className="w-[300px]">Query Details</TableHead>
              <TableHead className="w-[120px]">Image</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[150px]">History</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? skeletonRows
              : tenantQs.map((tenantQ) => {
                const property = tenantQ.Tenant_property || {};
                
                return (
                  <TableRow
                    key={tenantQ._id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => openDetail(tenantQ)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {property.title || "Property"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">
                                {formatAddress(property)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {property.owner_name || property.owner_email || "Owner not specified"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <div className="line-clamp-2">{tenantQ.Testimonial}</div>
                    </TableCell>
                    
                    <TableCell>
                      {tenantQ.image ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={tenantQ.image} alt="Query image" />
                          <AvatarFallback>
                            <Building className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <Building className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(tenantQ.Status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatShortDate(tenantQ.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{formatShortDate(tenantQ.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Updated:</span>
                          <span>{formatShortDate(tenantQ.updatedAt)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTenantQ(tenantQ._id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTenantQ(tenantQ._id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
      
      {add_or_update_tenantQ && (
        <AddTenantQForm
          open={add_or_update_tenantQ}
          onOpenChange={set_add_or_update_tenantQ}
          onTenantQCreated={fetchTenantQs}
          tenantQId={currentTenantQId}
        />
      )}

      {/* Detail Modal */}
      {detailTenantQ && (
        <Dialog open={!!detailTenantQ} onOpenChange={closeDetail}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tenant Query Details</DialogTitle>
              <DialogDescription>
                Complete information for query #{detailTenantQ._id?.slice(-6)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Property Information */}
              <div className="p-4 rounded-lg border bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" /> Property Information
                </h3>
                {detailTenantQ.Tenant_property ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Title:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.title || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Address:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.address || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">City:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.city || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Postal Code:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.postalCode || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Owner Name:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.owner_name || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">Owner Email:</span>
                      <p className="font-medium">{detailTenantQ.Tenant_property.owner_email || "N/A"}</p>
                    </div>
                    {detailTenantQ.Tenant_property.price && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Price:</span>
                        <p className="font-medium">${detailTenantQ.Tenant_property.price}</p>
                      </div>
                    )}
                    {detailTenantQ.Tenant_property.status && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Status:</span>
                        <p className="font-medium capitalize">{detailTenantQ.Tenant_property.status}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No property information available</p>
                    <p className="text-xs mt-1">Property ID: {detailTenantQ.Tenant_property?._id || "Not linked"}</p>
                  </div>
                )}
              </div>

              {/* Query Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Query Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(detailTenantQ.Status)}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDate(detailTenantQ.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(detailTenantQ.updatedAt)}</p>
                </div>
              </div>

              {/* Query Details */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Query Details</p>
                <div className="rounded border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap">{detailTenantQ.Testimonial}</p>
                </div>
              </div>

              {/* Image Attachment */}
              {detailTenantQ.image && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Attached Image</p>
                  <div className="border rounded-md p-4 bg-white">
                    <img 
                      src={detailTenantQ.image} 
                      alt="Query attachment" 
                      className="max-h-64 rounded-md object-contain mx-auto"
                    />
                    <div className="text-center mt-2">
                      <a 
                        href={detailTenantQ.image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Full Image
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={closeDetail}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {detailTenantQ.Status !== "resolved" && (
                <Button 
                  onClick={markResolved} 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}