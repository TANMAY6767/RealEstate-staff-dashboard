// controllers/dashboardController.js
import Property from "../../models/Property.js";
import RentCollection from "../../models/RentCollection.js";
import TenantQ from "../../models/TenantQ.js";
import mongoose from "mongoose";

export const getPropertyDashboardData = async (req, res) => {
  try {
    const { timeRange = "6m", country = "all" } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    // Get all statistics
    const totalProperties = await Property.countDocuments();
    const rentedProperties = await Property.countDocuments({ status: "rented" });
    const availableProperties = await Property.countDocuments({ status: "available" });
    const soldProperties = await Property.countDocuments({ status: "sold" });

    // Total rent collected this month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyRent = await RentCollection.aggregate([
      {
        $match: {
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$paid_amount" },
          totalExpected: { $sum: "$rent_amount" }
        }
      }
    ]);

    // Tenant query statistics
    const tenantQueries = await TenantQ.countDocuments();
    const pendingQueries = await TenantQ.countDocuments({ Status: "pending" });
    const resolvedQueries = await TenantQ.countDocuments({ Status: "resolved" });

    // Recent activities
    const recentRentCollections = await RentCollection.find()
      .populate("property_id", "title address")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentQueries = await TenantQ.find()
      .populate("Tenant_property", "title address")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalProperties,
          rentedProperties,
          availableProperties,
          soldProperties,
          monthlyRentCollected: monthlyRent[0]?.totalCollected || 0,
          monthlyRentExpected: monthlyRent[0]?.totalExpected || 0,
          totalTenantQueries: tenantQueries,
          pendingQueries,
          resolvedQueries,
          collectionRate: monthlyRent[0] 
            ? ((monthlyRent[0].totalCollected / monthlyRent[0].totalExpected) * 100).toFixed(1)
            : 0
        },
        recentActivities: {
          rentCollections: recentRentCollections,
          queries: recentQueries
        },
        timeRange,
        country
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMonthlyRentCollectionData = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await RentCollection.aggregate([
      {
        $match: {
          year: parseInt(year)
        }
      },
      {
        $group: {
          _id: "$month",
          totalCollected: { $sum: "$paid_amount" },
          totalExpected: { $sum: "$rent_amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    // Format for chart
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedData = monthOrder.map(month => {
      const monthData = monthlyData.find(d => d._id === month);
      return {
        month,
        collected: monthData?.totalCollected || 0,
        expected: monthData?.totalExpected || 0,
        transactions: monthData?.count || 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPropertyStatusData = async (req, res) => {
  try {
    const statusData = await Property.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$price" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: statusData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTenantQueryStatsData = async (req, res) => {
  try {
    const queryStats = await TenantQ.aggregate([
      {
        $group: {
          _id: "$Status",
          count: { $sum: 1 },
          recent: {
            $push: {
              id: "$_id",
              testimonial: "$Testimonial",
              createdAt: "$createdAt"
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: queryStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};