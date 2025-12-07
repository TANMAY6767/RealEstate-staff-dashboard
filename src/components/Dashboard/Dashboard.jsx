"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Home,
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import html2canvas from "html2canvas";
import { 
  getPropertyDashboardData
} from "@/services/dashboard/dashboardServices";
import { toast } from "sonner";
import { checkPermission } from "@/helper/commonHelper";
import SearchLoader from "../custom_ui/SearchLoader";

export function PropertyDashboard() {
  const [activeTimeRange, setActiveTimeRange] = useState("6m");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const rentChartRef = useRef(null);
  const propertyChartRef = useRef(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const STATUS_COLORS = {
    available: '#10B981',
    rented: '#3B82F6',
    sold: '#6B7280',
    pending: '#F59E0B',
    resolved: '#10B981'
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch main dashboard data
        const dashboardResponse = await getPropertyDashboardData({
          timeRange: activeTimeRange
        });
      
        
        if (dashboardResponse.data && dashboardResponse.data.data) {
          setDashboardData(dashboardResponse.data.data.data || dashboardResponse.data.data);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTimeRange]);

  // Function to export chart as PNG
  const exportChartAsPNG = (chartRef, filename) => {
    if(!checkPermission("profile","download")){
      toast.error("You don't have the permission to download dashboard data");
      return;
    }
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Prepare property status chart data from dashboard statistics
  const preparePropertyChartData = () => {
    const stats = dashboardData?.statistics || {};
    return [
      { name: 'Rented', value: stats.rentedProperties || 0, color: STATUS_COLORS.rented },
      { name: 'Available', value: stats.availableProperties || 0, color: STATUS_COLORS.available },
      { name: 'Sold', value: stats.soldProperties || 0, color: STATUS_COLORS.sold }
    ].filter(item => item.value > 0);
  };

  // Prepare query status data
  const prepareQueryStatsData = () => {
    const stats = dashboardData?.statistics || {};
    return [
      { name: 'Pending', value: stats.pendingQueries || 0, color: STATUS_COLORS.pending },
      { name: 'Resolved', value: stats.resolvedQueries || 0, color: STATUS_COLORS.resolved }
    ].filter(item => item.value > 0);
  };

  // Prepare monthly rent data for chart from recent activities
  const prepareMonthlyRentData = () => {
    const rentCollections = dashboardData?.recentActivities?.rentCollections || [];
    
    // Group by month and year
    const monthlyData = {};
    
    rentCollections.forEach(collection => {
      const monthYear = `${collection.month} ${collection.year}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          collected: 0,
          expected: 0,
          count: 0
        };
      }
      monthlyData[monthYear].collected += collection.paid_amount || 0;
      monthlyData[monthYear].expected += collection.rent_amount || 0;
      monthlyData[monthYear].count += 1;
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      // Sort by date
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);
      
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      }
      return monthIndexA - monthIndexB;
    }).slice(0, 6); // Show last 6 months
  };

  const { statistics = {}, recentActivities = {} } = dashboardData || {};

  // Calculate performance metrics
  const calculatePerformance = () => {
    const collected = statistics.monthlyRentCollected || 0;
    const expected = statistics.monthlyRentExpected || 0;
    const collectionRate = statistics.collectionRate || 0;
    
    return {
      collected,
      expected,
      collectionRate,
      outstanding: expected - collected,
      percentageCollected: expected > 0 ? (collected / expected * 100).toFixed(1) : 0
    };
  };

  const performance = calculatePerformance();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
    >
      {loading && <SearchLoader />}
      
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card-bg)"
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--heading)" }}>
                Property Management Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text)" }}>
                Overview of your properties, rent collection, and tenant management
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <select
                value={activeTimeRange}
                onChange={(e) => setActiveTimeRange(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)"
                }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Performance Overview */}
        <div className="p-6 rounded-xl border shadow-sm"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--heading)" }}>
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Rent Collection
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {performance.collectionRate}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${performance.collectionRate >= 90 ? 'bg-green-100 text-green-600' : performance.collectionRate >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                  {performance.collectionRate >= 90 ? <TrendingUp size={20} /> : 
                   performance.collectionRate >= 70 ? <ArrowUpRight size={20} /> : <TrendingDown size={20} />}
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                {formatCurrency(performance.collected)} of {formatCurrency(performance.expected)} collected
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Property Utilization
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.totalProperties ? Math.round((statistics.rentedProperties / statistics.totalProperties) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Building size={20} />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                {statistics.rentedProperties || 0} of {statistics.totalProperties || 0} properties rented
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Query Resolution
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.totalTenantQueries ? Math.round((statistics.resolvedQueries / statistics.totalTenantQueries) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <FileText size={20} />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                {statistics.resolvedQueries || 0} of {statistics.totalTenantQueries || 0} queries resolved
              </p>
            </div>
          </div>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Properties Card */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Building size={16} /> Total Properties
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: "var(--heading)" }}>
                  {statistics.totalProperties || 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    {statistics.rentedProperties || 0} Rented
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                    {statistics.availableProperties || 0} Available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Rent Collection Card */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <DollarSign size={16} /> Rent Collected
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: "var(--heading)" }}>
                  {formatCurrency(statistics.monthlyRentCollected || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {statistics.collectionRate || 0}% of expected
                  </span>
                  <ArrowUpRight className="h-4 w-4 ml-1 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Queries Card */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Users size={16} /> Tenant Queries
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: "var(--heading)" }}>
                  {statistics.totalTenantQueries || 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
                    {statistics.pendingQueries || 0} Pending
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                    {statistics.resolvedQueries || 0} Resolved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outstanding Rent Card */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <AlertCircle size={16} /> Outstanding Rent
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: "var(--heading)" }}>
                  {formatCurrency(performance.outstanding)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm" style={{ color: performance.outstanding > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                    {performance.outstanding > 0 ? 'Action Required' : 'All Clear'}
                  </span>
                  {performance.outstanding > 0 && <ArrowDownRight className="h-4 w-4 ml-1 text-red-500" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Rent Collection Chart */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--heading)" }}>
                    Monthly Rent Collection
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Collected vs Expected Rent
                  </p>
                </div>
              </div>
              <button
                onClick={() => exportChartAsPNG(rentChartRef, "rent-collection-chart")}
                className="flex items-center gap-1 px-3 py-1 rounded text-sm hover:opacity-80 transition-all"
                style={{ backgroundColor: "var(--hover-bg)", color: "var(--hover-text)" }}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
            <div className="h-80" ref={rentChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareMonthlyRentData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--text-muted)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('$', '')}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border)",
                      color: "var(--text)"
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="collected"
                    name="Collected Rent"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expected"
                    name="Expected Rent"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {prepareMonthlyRentData().length === 0 && (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No rent collection data available</p>
              </div>
            )}
          </div>

          {/* Property Status Chart */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--heading)" }}>
                    Property Status Distribution
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Current status of all properties
                  </p>
                </div>
              </div>
              <button
                onClick={() => exportChartAsPNG(propertyChartRef, "property-status-chart")}
                className="flex items-center gap-1 px-3 py-1 rounded text-sm hover:opacity-80 transition-all"
                style={{ backgroundColor: "var(--hover-bg)", color: "var(--hover-text)" }}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
            <div className="h-80" ref={propertyChartRef}>
              {preparePropertyChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePropertyChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePropertyChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Properties"]}
                      contentStyle={{
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--border)",
                        color: "var(--text)"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No property data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rent Collections */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--heading)" }}>
              <DollarSign size={20} /> Recent Rent Collections
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivities.rentCollections?.map((collection) => (
                <div 
                  key={collection._id} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{collection.property_id?.title || 'N/A'}</p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          {collection.tenant_name} • {collection.month} {collection.year}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        collection.status === 'approved' 
                          ? 'bg-green-100 text-green-600' 
                          : collection.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {collection.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Paid: {formatCurrency(collection.paid_amount)}
                        </p>
                        {collection.balance > 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            Balance: {formatCurrency(collection.balance)}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold">{formatCurrency(collection.paid_amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!recentActivities.rentCollections || recentActivities.rentCollections.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent rent collections</p>
              )}
            </div>
          </div>

          {/* Recent Tenant Queries */}
          <div className="p-6 rounded-xl border shadow-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--heading)" }}>
              <FileText size={20} /> Recent Tenant Queries
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivities.queries?.map((query) => (
                <div 
                  key={query._id} 
                  className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        query.Status === 'resolved' 
                          ? 'bg-green-100 text-green-600' 
                          : query.Status === 'pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {query.Status === 'resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{query.Testimonial}</p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                          {query.Tenant_property?.title || 'N/A'}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                          {new Date(query.createdAt).toLocaleDateString()} • {new Date(query.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {query.image && (
                      <div className="mt-3">
                        <img 
                          src={query.image} 
                          alt="Query attachment" 
                          className="w-32 h-32 object-cover rounded-lg border"
                          style={{ borderColor: "var(--border)" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!recentActivities.queries || recentActivities.queries.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent tenant queries</p>
              )}
            </div>
          </div>
        </div>

        {/* Alerts & Insights Section */}
        <div className="p-6 rounded-xl border shadow-sm"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--heading)" }}>
            <AlertCircle size={20} /> Insights & Alerts
          </h3>
          <div className="space-y-3">
            {statistics.pendingQueries > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Pending Tenant Queries</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    You have {statistics.pendingQueries} queries awaiting your response. 
                    {statistics.pendingQueries > 3 ? ' Consider prioritizing resolution.' : ''}
                  </p>
                </div>
              </div>
            )}
            
            {statistics.availableProperties === 0 && statistics.totalProperties > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <Home className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Full Occupancy</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    All {statistics.totalProperties} properties are currently occupied. Great job!
                  </p>
                </div>
              </div>
            )}
            
            {statistics.availableProperties > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                <Home className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Properties Available</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    You have {statistics.availableProperties} properties available for rent. 
                    Consider marketing these properties.
                  </p>
                </div>
              </div>
            )}
            
            {performance.collectionRate < 90 && performance.collectionRate > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
                <DollarSign className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Rent Collection Attention Needed</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Rent collection rate is {statistics.collectionRate}% with {formatCurrency(performance.outstanding)} outstanding. 
                    Consider following up on pending payments.
                  </p>
                </div>
              </div>
            )}
            
            {performance.collectionRate >= 90 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Excellent Rent Collection</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Your rent collection rate is {statistics.collectionRate}% - Keep up the great work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}