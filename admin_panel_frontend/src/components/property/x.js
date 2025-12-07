"use client";
import DOMPurify from "dompurify";
import React, { useState, useEffect, useCallback } from "react";
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
import {
  SquarePen,
  Trash2,
  Eye,
  MoreVertical,
  FileText,
  Info,
  Filter,
  Columns,
  ChevronDown,
  Image as ImageIcon,
  MapPin,
  User,
  Mail,
  Tag,
  Calendar,
  DollarSign,
  Building
} from "lucide-react";
import { Button } from "../ui/button";
import { CustomPagination } from "..";
import { Badge } from "../ui/badge";
import { AddCarForm } from "./AddPropertyForm";
import { getAllCars, deleteCar, exportCarsToExcel } from "@/services/property/propertyServices";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import SearchLoader from "@/components/custom_ui/SearchLoader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Column Visibility Component - Improved
function ColumnVisibility({ columnVisibility, setColumnVisibility }) {
  const [open, setOpen] = useState(false);

  const columns = [
    { id: 'sr', label: 'SR', defaultVisible: true, fixed: true },
    { id: 'id', label: 'ID', defaultVisible: true },
    { id: 'title', label: 'Title', defaultVisible: true, fixed: true },
    { id: 'description', label: 'Description', defaultVisible: false },
    { id: 'address', label: 'Address', defaultVisible: true },
    { id: 'city', label: 'City', defaultVisible: true },
    { id: 'price', label: 'Price', defaultVisible: true },
    { id: 'owner', label: 'Owner', defaultVisible: true },
    { id: 'status', label: 'Status', defaultVisible: true },
    { id: 'images', label: 'Images', defaultVisible: true },
    { id: 'createdAt', label: 'Created', defaultVisible: true },
    { id: 'actions', label: '', defaultVisible: true, fixed: true }
  ];

  return (
    <div className="duration-500 border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between w-full bg-primary/5 hover:bg-primary/10 px-4 py-3 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-medium">
          <Columns className="h-4 w-4" />
          <span>Customize Columns</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="p-4 bg-background border-t">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={column.id}
                  checked={columnVisibility[column.id]}
                  onChange={(e) =>
                    setColumnVisibility({
                      ...columnVisibility,
                      [column.id]: e.target.checked
                    })
                  }
                  disabled={column.fixed}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                />
                <label
                  htmlFor={column.id}
                  className={`text-sm ${column.fixed ? "text-muted-foreground font-medium" : ""}`}
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const defaultVisibility = {};
                columns.forEach(col => {
                  defaultVisibility[col.id] = col.defaultVisible;
                });
                setColumnVisibility(defaultVisibility);
              }}
              className="w-full"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Filters Component - Improved
function Filters({ filters, setFilters, applyFilters }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="duration-500 border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between w-full bg-primary/5 hover:bg-primary/10 px-4 py-3 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-medium">
          <Filter className="h-4 w-4" />
          <span>Filter Properties</span>
          {(filters.title || filters.address || filters.status !== "all") && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="p-4 bg-background border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="Search by title..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Search by address..."
                  value={filters.address}
                  onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              {filters.title || filters.address || filters.status !== "all"
                ? "Filters are active"
                : "No filters applied"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={applyFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="gap-2"
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

// Property Card View Component (Alternative View)
function PropertyCard({ property, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'rented': return 'bg-blue-500';
      case 'sold': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {property.main_image && !imageError ? (
          <Image
            src={property.main_image}
            alt={property.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Building className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(property.status)} text-white border-0`}>
            {property.status}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-semibold">
            ${property.price.toLocaleString()}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(property._id)}>
                <SquarePen className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(property)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Owner:</span>
            </div>
            <span className="font-medium">{property.owner_name}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email:</span>
            </div>
            <span className="truncate max-w-[150px]">{property.owner_email}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created:</span>
            </div>
            <span>{new Date(property.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export function CarSection({ isExpanded }) {
  const [addOrUpdateCar, setAddOrUpdateCar] = useState(false);
    const [currentCarData, setCurrentCarData] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCars, setTotalCars] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [carToView, setCarToView] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [moreInfoDialogOpen, setMoreInfoDialogOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
  
    // State for profile data
    const [profileData, setProfileData] = useState({
      companyData: null,
      bankingData: null,
      loading: true
    });

  // Add view mode state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Initialize column visibility with better defaults
  const [columnVisibility, setColumnVisibility] = useState({
    sr: true,
    id: false,
    title: true,
    description: false,
    address: true,
    city: true,
    price: true,
    owner: true,
    status: true,
    images: true,
    createdAt: true,
    actions: true
  });

  const [filters, setFilters] = useState({
    name: "",
    brand: "",
    status: "all",
    websiteState: "all"
  });
  const router = useRouter();

  // Permission check function
  const hasPermission = (operation) => {
    return checkPermission("cars", operation);
  };

  // Apply debouncing to all filter fields and search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Fetch profile data only once when component mounts (on page reload)
  const fetchProfileData = useCallback(async () => {
    try {
      setProfileData((prev) => ({ ...prev, loading: true }));
      const response = await getProfile(router);
      if (response.data.status) {
        const storedCompanyData = response.data.data.address;
        const storedBankingData = response.data.data.banks?.filter((d) => d.isActive == true);

        setProfileData({
          companyData: storedCompanyData || null,
          bankingData: storedBankingData || null,
          loading: false
        });
      } else {
        toast.error("Failed to fetch profile data");
        setProfileData((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile data");
      setProfileData((prev) => ({ ...prev, loading: false }));
    }
  }, [router]);

  const fetchCars = useCallback(async () => {
    try {
      setIsSearching(isInitial === false);
      const payload = {
        search: debouncedSearchTerm,
        limit: itemsPerPage,
        page: currentPage,
        ...(debouncedFilters.name && { name: debouncedFilters.name }),
        ...(debouncedFilters.brand && { brand: debouncedFilters.brand }),
        ...(debouncedFilters.status !== "all" && { status: debouncedFilters.status }),
        ...(debouncedFilters.websiteState !== "all" && {
          website_state: debouncedFilters.websiteState === "active"
        })
      };

      console.log("Fetching cars with payload:", payload); // Debug log

      const response = await getAllCars(payload, router);

      if (response.data.status) {
        setCars(response.data.data.cars);
        console.log(cars);
        const pagination_data = response.data.data.pagination;
        setItemsPerPage(pagination_data.itemsPerPage);
        setTotalCars(pagination_data.totalCars);
        setCurrentPage(pagination_data.currentPage);
        setTotalPages(pagination_data.totalPages);
      } else {
        toast.error(response.data.message || "Failed to fetch cars");
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to fetch cars");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, debouncedFilters, currentPage, itemsPerPage, router, isInitial]);

  // Effect to fetch cars when search, filters, or pagination changes
  useEffect(() => {
    if (!isInitial) {
      fetchCars();
    }
  }, [debouncedSearchTerm, debouncedFilters, currentPage, itemsPerPage, isInitial, fetchCars]);

  // Load profile data and cars on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchProfileData();
      await fetchCars();
      setIsInitial(false);
    };

    loadInitialData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSearch = (term) => {
    console.log("Search term:", term); // Debug log
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    // Reset all filters
    setFilters({
      name: "",
      brand: "",
      status: "all",
      websiteState: "all"
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle Excel export with permission check
  const handleExportToExcel = async () => {
    if (!hasPermission("download")) {
      toast.error("You don't have permission to download Excel files in Cars page");
      return;
    }

    try {
      toast.info("Preparing Excel export...");

      const payload = {
        search: searchTerm,
        ...(filters.title && { name: filters.title }),
        ...(filters.address && { brand: filters.address }),
        ...(filters.status !== "all" && { status: filters.status }),

      };

      await exportCarsToExcel(payload, router);
      toast.success("Cars exported to Excel successfully");
    } catch (error) {
      console.error("Error exporting cars to Excel:", error);
      toast.error("Failed to export cars to Excel");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol"
    }).format(price);
  };

  const handleEditCar = (carId) => {
    if (!hasPermission("edit")) {
      toast.error("You don't have permission to edit cars");
      return;
    }
    const carToEdit = cars.find((car) => car._id === carId);
    setCurrentCarData(carToEdit);
    setAddOrUpdateCar(true);
  };

  const handleAddCar = () => {
    if (!hasPermission("edit")) {
      toast.error("You don't have permission to add cars");
      return;
    }
    setCurrentCarData(null);
    setAddOrUpdateCar(true);
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setDetailsDialogOpen(true);
  };

  const handleViewMoreInfo = (car) => {
    setSelectedCar(car);
    setMoreInfoDialogOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (car) => {
    if (!hasPermission("delete")) {
      toast.error("You don't have permission to delete cars");
      return;
    }
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteCar(carToDelete._id, router);
      if (response.data.status) {
        toast.success("Car deleted successfully");
        fetchCars();
      } else {
        toast.error(response.data.message || "Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete car");
    } finally {
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    }
  };

  // Handle invoice update callback
  const handleInvoiceUpdate = () => {
    fetchCars(); // Refresh cars data after invoice update
  };

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48 bg-border" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32 bg-border" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-4 w-20 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-4 w-20 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-4 w-20 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-4 w-20 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-8 w-8 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-8 w-8 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="h-8 w-8 bg-border mx-auto" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
          <Skeleton className="h-8 w-8 bg-border" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-border" />
      </TableCell>
    </TableRow>
  ));

  // Add Search icon import
  const Search = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const X = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="w-full h-full space-y-4">
      {isSearching && <SearchLoader />}
      
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Property Management</CardTitle>
              <CardDescription>
                Manage your property inventory efficiently
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAddCar} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Property
              </Button>
              <Button
                variant="outline"
                onClick={handleExportToExcel}
                disabled={loading || cars.length === 0}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                    <p className="text-2xl font-bold">{totalCars}</p>
                  </div>
                  <Building className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">
                      {cars.filter(c => c.status === 'available').length}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rented</p>
                    <p className="text-2xl font-bold">
                      {cars.filter(c => c.status === 'rented').length}
                    </p>
                  </div>
                  <Badge className="bg-blue-500 text-white">Rented</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {cars.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search properties by title, address, city, or owner..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 py-6 text-base"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Filters filters={filters} setFilters={setFilters} applyFilters={applyFilters} />
              </div>
              <div className="lg:w-64">
                <ColumnVisibility
                  columnVisibility={columnVisibility}
                  setColumnVisibility={setColumnVisibility}
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCars)} of {totalCars} properties
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Table
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {columnVisibility.sr && <TableHead className="w-12 text-center">#</TableHead>}
                  {columnVisibility.title && <TableHead className="min-w-[180px]">Property</TableHead>}
                  {columnVisibility.address && <TableHead className="min-w-[200px]">Location</TableHead>}
                  {columnVisibility.city && <TableHead className="min-w-[100px]">City</TableHead>}
                  {columnVisibility.price && <TableHead className="min-w-[120px]">Price</TableHead>}
                  {columnVisibility.owner && <TableHead className="min-w-[150px]">Owner</TableHead>}
                  {columnVisibility.status && <TableHead className="min-w-[100px]">Status</TableHead>}
                  {columnVisibility.images && <TableHead className="min-w-[100px]">Images</TableHead>}
                  {columnVisibility.createdAt && <TableHead className="min-w-[120px]">Created</TableHead>}
                  {columnVisibility.actions && <TableHead className="w-20 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : cars.length > 0 ? (
                  cars.map((car, idx) => (
                    <TableRow key={car._id} className="hover:bg-muted/50 group">
                      {columnVisibility.sr && (
                        <TableCell className="text-center text-muted-foreground font-medium">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>
                      )}
                      
                      {columnVisibility.title && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">{car.title}</div>
                            {columnVisibility.description && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                <div dangerouslySetInnerHTML={{ 
                                  __html: DOMPurify.sanitize(car.description.substring(0, 100) + '...') 
                                }} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      
                      {columnVisibility.address && (
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                  <span className="truncate">{car.address}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{car.address}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      
                      {columnVisibility.city && (
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {car.city}
                          </Badge>
                        </TableCell>
                      )}
                      
                      {columnVisibility.price && (
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>{car.price.toLocaleString()}</span>
                          </div>
                        </TableCell>
                      )}
                      
                      {columnVisibility.owner && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{car.owner_name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {car.owner_email}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      {columnVisibility.status && (
                        <TableCell>
                          <Badge className={`
                            ${car.status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            ${car.status === 'rented' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                            ${car.status === 'sold' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                            ${car.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                            capitalize
                          `}>
                            {car.status}
                          </Badge>
                        </TableCell>
                      )}
                      
                      {columnVisibility.images && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {car.main_image ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative w-8 h-8 rounded overflow-hidden border">
                                      <Image
                                        src={car.main_image}
                                        alt="Main"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Main Image</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="w-8 h-8 rounded border flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            {car.images?.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{car.images.length}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                      
                      {columnVisibility.createdAt && (
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(car.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      )}
                      
                      {columnVisibility.actions && (
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCar(car._id)}
                                    className="h-8 w-8"
                                  >
                                    <SquarePen className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Property</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(car)}
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Property</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(car)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewMoreInfo(car)}>
                                  <Info className="h-4 w-4 mr-2" />
                                  More Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(car)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Property
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-muted-foreground">No properties found</p>
                        <Button variant="outline" onClick={handleAddCar}>
                          Add Your First Property
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {cars.length > 0 && (
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
                <div className="flex items-center gap-2 text-sm">
                  <span>Items per page:</span>
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
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* GRID VIEW */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map((car) => (
                <PropertyCard
                  key={car._id}
                  property={car}
                  onEdit={handleEditCar}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Building className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button onClick={handleAddCar}>
                  Add New Property
                </Button>
              </CardContent>
            </Card>
          )}
          
          {cars.length > 0 && totalPages > 1 && (
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

      {/* Add/Edit Dialog */}
      {addOrUpdateCar && (
        <AddCarForm
          open={addOrUpdateCar}
          onOpenChange={setAddOrUpdateCar}
          onCarCreated={fetchCars}
          carData={currentCarData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Delete Property</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <span className="font-semibold">{carToDelete?.title}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-center sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}