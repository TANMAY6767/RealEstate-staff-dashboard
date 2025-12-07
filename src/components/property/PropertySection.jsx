"use client";
import React, { useState, useEffect, useCallback } from "react";
import { SecondaryHeader } from "..";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SquarePen, Trash2, Eye, MoreVertical, Filter, Columns, ChevronDown, MapPin, User, Mail, DollarSign, Building, Plus, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { CustomPagination } from "..";
import { Badge } from "../ui/badge";
import { AddCarForm } from "./AddPropertyForm";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import { getAllProperty, deleteProperty } from "@/services/property/propertyServices";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import SearchLoader from "@/components/custom_ui/SearchLoader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Reusable Components with Theme Support
function SimpleDropdownMenu({ trigger, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-50">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownMenuItem({ children, onClick, className = "" }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function ColumnVisibility({ columnVisibility, setColumnVisibility }) {
  const [open, setOpen] = useState(false);
  const columns = [
    { id: 'sr', label: 'SR', defaultVisible: true, fixed: true },
    { id: 'title', label: 'Title', defaultVisible: true, fixed: true },
    { id: 'address', label: 'Address', defaultVisible: true },
    { id: 'city', label: 'City', defaultVisible: true },
    { id: 'price', label: 'Price', defaultVisible: true },
    { id: 'owner', label: 'Owner', defaultVisible: true },
    { id: 'status', label: 'Status', defaultVisible: true },
    { id: 'images', label: 'Images', defaultVisible: true },
    { id: 'actions', label: '', defaultVisible: true, fixed: true }
  ];

  return (
    <div className="border rounded-lg">
      <div 
        className="flex items-center justify-between bg-muted px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors" 
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-medium">
          <Columns className="h-4 w-4" /> Customize Columns
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Switch
                  id={column.id}
                  checked={columnVisibility[column.id]}
                  onCheckedChange={(checked) => setColumnVisibility({...columnVisibility, [column.id]: checked})}
                  disabled={column.fixed}
                />
                <label htmlFor={column.id} className="text-sm cursor-pointer select-none">
                  {column.label}
                </label>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => {
              const defaultVisibility = {};
              columns.forEach(col => {
                defaultVisibility[col.id] = col.defaultVisible;
              });
              setColumnVisibility(defaultVisibility);
            }}
          >
            Reset to Default
          </Button>
        </div>
      )}
    </div>
  );
}

function Filters({ filters, setFilters, applyFilters }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border rounded-lg">
      <div 
        className="flex items-center justify-between bg-muted px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors" 
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-medium">
          <Filter className="h-4 w-4" /> Filter Properties
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input 
                  value={filters.title} 
                  onChange={(e) => setFilters({...filters, title: e.target.value})} 
                  className="pl-9" 
                  placeholder="Search title" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input 
                  value={filters.address} 
                  onChange={(e) => setFilters({...filters, address: e.target.value})} 
                  className="pl-9" 
                  placeholder="Search address" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  {/* <SelectItem value="pending">Pending</SelectItem> */}
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              {filters.title || filters.address || filters.status !== "all" ? "Active filters" : "No filters applied"}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={applyFilters}
              >
                <X className="h-4 w-4 mr-2" /> Clear All
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, onEdit, onDelete, onViewDetails }) {
  const [imageError, setImageError] = useState(false);
  
  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30',
      'rented': 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30',
      'sold': 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30',
      'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/30',
      'maintenance': 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30'
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200 dark:border-gray-800';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        {property.main_image && !imageError ? (
          <Image 
            src={property.main_image} 
            alt={property.title} 
            fill 
            className="object-cover" 
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(property.status)} font-medium`}>
            {property.status}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-semibold">
            ${property.price?.toLocaleString()}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold truncate text-lg">{property.title}</h3>
          <SimpleDropdownMenu trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }>
            <DropdownMenuItem onClick={() => onEdit(property._id)}>
              <SquarePen className="h-4 w-4 inline mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(property)}>
              <Eye className="h-4 w-4 inline mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(property)} 
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 inline mr-2" /> Delete
            </DropdownMenuItem>
          </SimpleDropdownMenu>
        </div>
        
        <p className="text-muted-foreground flex items-center gap-1 mb-3 text-sm">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{property.address}, {property.city}</span>
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Owner:</span>
            <span className="font-medium truncate max-w-[150px]">{property.owner_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Email:</span>
            <span className="truncate max-w-[150px] text-muted-foreground">{property.owner_email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Rooms:</span>
            <Badge variant="outline">{property.rooms || 'N/A'}</Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 hover:bg-primary hover:text-primary-foreground" 
          onClick={() => onViewDetails(property)}
        >
          <Eye className="h-3 w-3 mr-2" /> View Full Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Stats Cards Component
function StatCard({ label, value, icon: Icon, color, badge }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-500/10 border-purple-200 dark:border-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <Card className={`border ${colorClasses[color] || 'bg-card'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            )}
            {Icon && <Icon className="h-8 w-8 opacity-50" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export function PropertySection() {
  // State
  const [addOrUpdateCar, setAddOrUpdateCar] = useState(false);
  const [currentCarData, setCurrentCarData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({ title: "", address: "", status: "all" });
  const [columnVisibility, setColumnVisibility] = useState({
    sr: true, title: true, address: true, city: true, price: true, owner: true, status: true, images: true, actions: true
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Functions
  const fetchProperties = useCallback(async () => {
    try {
      setIsSearching(!isInitial);
      const payload = {
        search: debouncedSearchTerm,
        limit: itemsPerPage,
        page: currentPage,
        ...(debouncedFilters.title && { name: debouncedFilters.title }),
        ...(debouncedFilters.address && { brand: debouncedFilters.address }),
        ...(debouncedFilters.status !== "all" && { status: debouncedFilters.status }),
      };

      const response = await getAllProperty(payload, router);
      if (response.data.status) {
        setProperties(response.data.data.cars || []);
        const pagination = response.data.data.pagination;
        setItemsPerPage(pagination.itemsPerPage);
        setTotalProperties(pagination.totalCars);
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch properties");
      console.error("Fetch properties error:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, debouncedFilters, currentPage, itemsPerPage, router, isInitial]);

  useEffect(() => {
    if (!isInitial) fetchProperties();
  }, [debouncedSearchTerm, debouncedFilters, currentPage, itemsPerPage, isInitial, fetchProperties]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchProperties();
      setIsInitial(false);
    };
    loadInitialData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setFilters({ title: "", address: "", status: "all" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleEditProperty = (propertyId) => {
    const propertyToEdit = properties.find((property) => property._id === propertyId);
    setCurrentCarData(propertyToEdit);
    setAddOrUpdateCar(true);
  };

  const handleAddProperty = () => {
    setCurrentCarData(null);
    setAddOrUpdateCar(true);
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting property...");
    
    try {
      const response = await deleteProperty(propertyToDelete._id, router);
      
      if (response.data.status) {
        toast.success("Property deleted successfully", { id: toastId });
        fetchProperties();
      } else {
        toast.error(response.data.message || "Failed to delete property", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.", { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setViewDetailsDialogOpen(true);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  // Calculate statistics
  const stats = {
    total: totalProperties,
    available: properties.filter(p => p.status === 'available').length,
    rented: properties.filter(p => p.status === 'rented').length,
    sold: properties.filter(p => p.status === 'sold').length,
    pending: properties.filter(p => p.status === 'pending').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length
  };

  const getStatusBadge = (status) => {
    const variants = {
      'available': 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30',
      'rented': 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30',
      'sold': 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30',
      'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/30',
      'maintenance': 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30'
    };
    
    return (
      <Badge className={`capitalize ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 bg-background">
      {isSearching && <SearchLoader />}
      
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Property Management</CardTitle>
              <p className="text-muted-foreground mt-1">Manage your property inventory efficiently</p>
            </div>
            <Button onClick={handleAddProperty} className="gap-2">
              <Plus className="h-4 w-4" /> Add New Property
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Total Properties" 
              value={stats.total} 
              icon={Building} 
              color="blue"
            />
            <StatCard 
              label="Available" 
              value={stats.available} 
              badge="Active"
              color="green"
            />
            <StatCard 
              label="Rented" 
              value={stats.rented} 
              badge="Occupied"
              color="blue"
            />
            <StatCard 
              label="Sold" 
              value={stats.sold} 
              badge="Processing"
              color="yellow"
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 text-muted-foreground -translate-y-1/2" />
            <Input
              placeholder="Search properties by title, address, or owner..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 py-6"
            />
          </div>

          {/* Filters & Columns */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Filters filters={filters} setFilters={setFilters} applyFilters={applyFilters} />
            </div>
            <div className="lg:w-64">
              <ColumnVisibility columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />
            </div>
          </div>

          {/* View Toggle and Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProperties)} of {totalProperties} properties
                  {debouncedFilters.status !== "all" && ` (Filtered: ${stats[debouncedFilters.status] || 0})`}
                </>
              )}
            </div>
            
            <Tabs defaultValue="table" value={viewMode} onValueChange={setViewMode} className="w-auto">
              <TabsList>
                <TabsTrigger value="table" className="gap-2">
                  <Columns className="h-4 w-4" /> Table
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2">
                  <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                  </div>
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Content Section */}
      {viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {columnVisibility.sr && <TableHead className="w-12">#</TableHead>}
                  {columnVisibility.title && <TableHead>Property</TableHead>}
                  {columnVisibility.address && <TableHead>Location</TableHead>}
                  {columnVisibility.city && <TableHead>City</TableHead>}
                  {columnVisibility.price && <TableHead>Price</TableHead>}
                  {columnVisibility.owner && <TableHead>Owner</TableHead>}
                  {columnVisibility.status && <TableHead>Status</TableHead>}
                  {columnVisibility.images && <TableHead>Images</TableHead>}
                  {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                )) : properties.length > 0 ? properties.map((property, idx) => (
                  <TableRow key={property._id} className="hover:bg-muted/50">
                    {columnVisibility.sr && (
                      <TableCell className="font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>
                    )}
                    {columnVisibility.title && (
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          
                          <span>{property.title}</span>
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.address && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{property.address}</span>
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.city && (
                      <TableCell>
                        <Badge variant="outline">{property.city}</Badge>
                      </TableCell>
                    )}
                    {columnVisibility.price && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.price?.toLocaleString()}</span>
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.owner && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.owner_name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {property.owner_email}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.status && (
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                    )}
                    {columnVisibility.images && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {property.main_image ? (
                            <div className="relative w-8 h-8 rounded border overflow-hidden">
                              <Image 
                                src={property.main_image} 
                                alt="Main" 
                                fill 
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center">
                              <Building className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          {property.images?.length > 0 && (
                            <Badge variant="secondary">+{property.images.length}</Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.actions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditProperty(property._id)}
                            className="h-8 w-8"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewDetails(property)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(property)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">No properties found</p>
                      <Button variant="outline" onClick={handleAddProperty}>
                        Add Your First Property
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {properties.length > 0 && (
            <div className="border-t p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <CustomPagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => { 
                    setItemsPerPage(parseInt(value)); 
                    setCurrentPage(1); 
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteClick}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter to find what you're looking for
                </p>
                <Button onClick={handleAddProperty}>Add New Property</Button>
              </CardContent>
            </Card>
          )}
          
          {properties.length > 0 && totalPages > 1 && (
            <div className="mt-6">
              <CustomPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
                className="justify-center" 
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {addOrUpdateCar && (
        <AddCarForm 
          open={addOrUpdateCar} 
          onOpenChange={setAddOrUpdateCar} 
          onCarCreated={fetchProperties} 
          carData={currentCarData} 
        />
      )}
      
      <PropertyDetailsModal 
        open={viewDetailsDialogOpen} 
        onOpenChange={setViewDetailsDialogOpen} 
        property={selectedProperty} 
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Property</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{propertyToDelete?.title}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}