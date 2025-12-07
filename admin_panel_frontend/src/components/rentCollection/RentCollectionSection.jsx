"use client";
import React, { useState, useEffect, useCallback } from "react";
import { SecondaryHeader } from "..";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  getAllRentCollections,
  updateRentCollectionStatus,
  deleteRentCollection,
  getRentStatistics
} from "@/services/rentCollection/rentCollectionServices";
import {
  SquarePen,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  Filter,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "..";
import { Badge } from "@/components/ui/badge";
import { AddRentCollectionForm } from "./AddRentCollectionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import SearchLoader from "@/components/custom_ui/SearchLoader";
import { toast } from "sonner";
import { checkPermission } from "@/helper/commonHelper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function RentCollectionSection({ isExpanded }) {
  // State
  const [addRentRecord, setAddRentRecord] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [detailRecord, setDetailRecord] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  
  // Add state for status counts
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    overdue: 0,
    all: 0
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Records
  const fetchRecords = useCallback(async () => {
    try {
      setIsSearching(isInitial === false);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter,
        month: monthFilter !== "all" ? monthFilter : undefined,
        year: yearFilter
      };

      const response = await getAllRentCollections(params);
      
      if (response?.data?.status) {
        const data = response.data.data;
        setRecords(data.rentCollections || []);
        setTotalRecords(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 0);
        
        // Update status counts from the response summary
        if (data.summary) {
          setStatusCounts({
            pending: data.summary.pendingCount || 0,
            approved: data.summary.approvedCount || 0,
            rejected: data.summary.rejectedCount || 0,
            overdue: data.summary.overdueCount || 0,
            all: data.pagination?.total || 0
          });
        }
        
        // If this is the first load, fetch statistics
        if (isInitial && statusFilter === "pending") {
          fetchStatistics();
        }
      } else {
        setRecords([]);
        setTotalRecords(0);
        setTotalPages(0);
        toast.error("Failed to fetch rent collection records");
      }

      setLoading(false);
      setIsSearching(false);
    } catch (error) {
      console.error("Error fetching rent collections:", error);
      setRecords([]);
      setTotalRecords(0);
      setTotalPages(0);
      setLoading(false);
      setIsSearching(false);
      toast.error("Failed to fetch rent collection records");
    }
  }, [debouncedSearchTerm, currentPage, itemsPerPage, isInitial, statusFilter, monthFilter, yearFilter]);

  // Fetch Statistics
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await getRentStatistics({ year: yearFilter });
      if (response?.data?.status) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitial) {
      setLoading(true);
    }
    fetchRecords();
    setIsInitial(false);
  }, [fetchRecords]);

  useEffect(() => {
    if (statusFilter === "approved") {
      fetchStatistics();
    }
  }, [statusFilter, yearFilter]);

  // Handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleMonthFilter = (month) => {
    setMonthFilter(month);
    setCurrentPage(1);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/30",
      approved: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30",
      rejected: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30",
      overdue: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30"
    };
    
    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      overdue: <AlertCircle className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge variant="outline" className={`${variants[status] || "bg-muted"} capitalize`}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const variants = {
      cash: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30",
      "bank_transfer": "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30",
      check: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/30",
      online: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/30",
      card: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-900/30"
    };
    
    const methodText = method ? method.replace("_", " ").charAt(0).toUpperCase() + method.slice(1) : "Unknown";
    
    return (
      <Badge variant="outline" className={variants[method] || "bg-muted"}>
        {methodText}
      </Badge>
    );
  };

  const handleReview = (record, action) => {
    if (!checkPermission("rentcollection", "edit")) {
      toast.error("You don't have permission to review rent records");
      return;
    }
    
    setDetailRecord(record);
    setReviewAction(action);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const confirmReview = async () => {
    try {
      const response = await updateRentCollectionStatus(
        detailRecord._id,
        {
          status: reviewAction,
          review_notes: reviewNotes
        }
      );

      if (response?.data?.status) {
        toast.success(`Rent record ${reviewAction} successfully`);
        setReviewDialogOpen(false);
        fetchRecords();
      } else {
        toast.error("Failed to update rent record status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update rent record status");
    }
  };

  const handleDeleteClick = (record) => {
    if (!checkPermission("rentcollection", "delete")) {
      toast.error("You don't have permission to delete rent records");
      return;
    }
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteRentCollection(recordToDelete._id);
      if (response?.data?.status) {
        toast.success("Rent record deleted successfully");
        setDeleteDialogOpen(false);
        fetchRecords();
      } else {
        toast.error("Failed to delete rent record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete rent record");
    }
  };

  const handleAddRecord = () => {
    if (!checkPermission("rentcollection", "edit")) {
      toast.error("You don't have permission to add rent records");
      return;
    }
    setCurrentRecordId(null);
    setAddRentRecord(true);
  };

  const handleEditRecord = (recordId) => {
    if (!checkPermission("rentcollection", "edit")) {
      toast.error("You don't have permission to edit rent records");
      return;
    }
    setCurrentRecordId(recordId);
    setAddRentRecord(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
  };

  // Calculate summary
  const calculateSummary = () => {
    if (!records.length) return { totalRent: 0, totalPaid: 0, totalBalance: 0 };
    
    return records.reduce(
      (acc, record) => ({
        totalRent: acc.totalRent + record.rent_amount,
        totalPaid: acc.totalPaid + record.paid_amount,
        totalBalance: acc.totalBalance + (record.rent_amount - record.paid_amount)
      }),
      { totalRent: 0, totalPaid: 0, totalBalance: 0 }
    );
  };

  const summary = calculateSummary();

  // Stats Cards Component
  const StatCard = ({ label, value, icon: Icon, color, trend, description }) => {
    const colorClasses = {
      blue: 'bg-blue-500/10 border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-500/10 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400',
      red: 'bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400',
      yellow: 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      orange: 'bg-orange-500/10 border-orange-200 dark:border-orange-900/30 text-orange-600 dark:text-orange-400'
    };

    return (
      <Card className={`border ${colorClasses[color] || 'bg-card'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {Icon && <Icon className="h-8 w-8 opacity-50" />}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span className="text-muted-foreground">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full h-full space-y-6">
      {isSearching && <SearchLoader />}
      
      <SecondaryHeader
        title="Rent Collection"
        searchPlaceholder="Search by tenant, property, receipt..."
        buttonText="Add Rent Record"
        tooltipText="Add New Rent Collection Record"
        onButtonClick={handleAddRecord}
        onMobileButtonClick={handleAddRecord}
        onSearch={handleSearch}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Rent" 
          value={formatCurrency(summary.totalRent)} 
          icon={DollarSign} 
          color="blue"
          description="Total rent amount"
        />
        
        <StatCard 
          label="Total Paid" 
          value={formatCurrency(summary.totalPaid)} 
          icon={CheckCircle} 
          color="green"
          description="Amount received"
        />
        
        <StatCard 
          label="Pending Balance" 
          value={formatCurrency(summary.totalBalance)} 
          icon={AlertCircle} 
          color={summary.totalBalance > 0 ? "red" : "green"}
          description="Balance to collect"
        />
        
        <StatCard 
          label="Total Records" 
          value={totalRecords}
          icon={FileText} 
          color="yellow"
          description={`${statusFilter} records`}
        />
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Status Tabs */}
          <Tabs defaultValue="pending" value={statusFilter} onValueChange={handleStatusFilter}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
                {statusCounts.pending > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
                {statusCounts.approved > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.approved}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
                {statusCounts.rejected > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.rejected}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Filter className="h-4 w-4" />
                All Records
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Month</Label>
                <Select value={monthFilter} onValueChange={handleMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Year</Label>
                <Select value={yearFilter.toString()} onValueChange={(value) => handleYearFilter(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Items per page</Label>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-5 w-40" />
          ) : totalRecords > 0 ? (
            `Showing ${((currentPage - 1) * itemsPerPage + 1).toLocaleString()} to ${Math.min(currentPage * itemsPerPage, totalRecords).toLocaleString()} of ${totalRecords.toLocaleString()} records`
          ) : (
            "No records found"
          )}
        </div>
        
        <Tabs defaultValue="table" value={viewMode} onValueChange={setViewMode} className="w-auto">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="grid">Card View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Tenant</TableHead>
                  <TableHead className="w-[200px]">Property</TableHead>
                  <TableHead className="w-[120px]">Month/Year</TableHead>
                  <TableHead className="w-[150px]">Amount</TableHead>
                  <TableHead className="w-[120px]">Payment</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Due Date</TableHead>
                  <TableHead className="w-[120px]">Paid Date</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : records.length > 0 ? (
                  records.map((record) => (
                    <TableRow key={record._id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{record.tenant_name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {record.tenant_email}
                          </div>
                          {record.tenant_phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {record.tenant_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{record.property?.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {record.property?.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.month} {record.year}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(record.rent_amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            Paid: {formatCurrency(record.paid_amount)}
                          </div>
                          {record.balance > 0 && (
                            <div className="text-xs text-destructive">
                              Balance: {formatCurrency(record.balance)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getPaymentMethodBadge(record.payment_method)}
                          {record.receipt_number && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Receipt: {record.receipt_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(record.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {record.paid_date ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {formatDate(record.paid_date)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {record.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReview(record, "approved")}
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReview(record, "rejected")}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(record)}
                            className="h-8 w-8"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRecord(record._id)}
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(record)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">No rent collection records found</p>
                      <Button variant="outline" onClick={handleAddRecord}>Add Your First Record</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {records.length > 0 && totalPages > 1 && (
            <div className="border-t p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          )}
        </Card>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : records.length > 0 ? (
            records.map((record) => (
              <Card key={record._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">{record.tenant_name}</div>
                      <div className="text-sm text-muted-foreground">{record.property?.title}</div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Month/Year</div>
                      <div className="font-medium">{record.month} {record.year}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <div className="font-medium">{formatDate(record.due_date)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="text-xl font-bold">{formatCurrency(record.rent_amount)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Paid: {formatCurrency(record.paid_amount)}
                      {record.balance > 0 && (
                        <span className="text-destructive ml-2">Balance: {formatCurrency(record.balance)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                    {getPaymentMethodBadge(record.payment_method)}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {record.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(record, "approved")}
                          className="flex-1 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(record, "rejected")}
                          className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRecord(record._id)}
                      className="flex-1"
                    >
                      <SquarePen className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rent Records Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or add a new rent collection record
                </p>
                <Button onClick={handleAddRecord}>Add New Record</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Statistics for Approved Records */}
      {statusFilter === "approved" && statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rent Collection Statistics {statistics.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {statistics.statistics.map((monthStat) => {
                  const percentage = monthStat.totalRent > 0 ? (monthStat.totalPaid / monthStat.totalRent) * 100 : 0;
                  
                  return (
                    <div key={monthStat._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{monthStat._id}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(monthStat.totalPaid)} / {formatCurrency(monthStat.totalRent)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={percentage} className="flex-1 h-2" />
                        <div className="text-xs text-muted-foreground w-12 text-right">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {monthStat.count} record{monthStat.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {addRentRecord && (
        <AddRentCollectionForm
          open={addRentRecord}
          onOpenChange={setAddRentRecord}
          onRecordCreated={fetchRecords}
          recordId={currentRecordId}
        />
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved" ? "Approve Rent Record" : "Reject Rent Record"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approved" 
                ? "Are you sure you want to approve this rent collection?" 
                : "Are you sure you want to reject this rent collection?"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{detailRecord?.tenant_name}</div>
              <div className="text-sm text-muted-foreground">{detailRecord?.property?.title}</div>
              <div className="text-sm mt-2">
                <span className="font-medium">Amount:</span> {formatCurrency(detailRecord?.rent_amount || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">
                {reviewAction === "approved" ? "Approval Notes" : "Rejection Notes"} (Optional)
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes or comments..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              className={reviewAction === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {reviewAction === "approved" ? "Approve Record" : "Reject Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Rent Record</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete the rent record for{" "}
              <span className="font-semibold text-foreground">{recordToDelete?.tenant_name}</span>?
              <br />
              <span className="text-sm text-muted-foreground">
                {recordToDelete?.property?.title} - {recordToDelete?.month} {recordToDelete?.year}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}