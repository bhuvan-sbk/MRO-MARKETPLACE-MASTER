// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/booking');
const Review = require('../models/review'); // Updated to match your model naming convention
const User = require('../models/User');

router.get('/metrics', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Base query for bookings
        let bookingQuery = userRole === 'admin' 
            ? {} 
            : { customerId: userId };

        // Get booking metrics with error handling for each Promise
        const metrics = await Promise.allSettled([
            // Basic booking metrics
            Booking.countDocuments(bookingQuery),
            Booking.countDocuments({ ...bookingQuery, status: 'pending' }),
            Booking.countDocuments({ ...bookingQuery, status: 'completed' }),
            
            // Reviews and ratings
            Review.aggregate([
                { 
                    $match: userRole === 'admin' 
                        ? {} 
                        : { userId: userId } 
                },
                { 
                    $group: { 
                        _id: null, 
                        avg: { $avg: '$rating' },
                        count: { $sum: 1 }
                    } 
                }
            ]),

            // Recent bookings with full details
            Booking.find(bookingQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customerId', 'name email')
                .populate('services', 'name price'),

            // Additional metrics for admins
            ...(userRole === 'admin' ? [
                User.countDocuments({ role: 'customer' }),
                Booking.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$totalAmount' },
                            averageBookingValue: { $avg: '$totalAmount' }
                        }
                    }
                ])
            ] : [])
        ]);

        // Process the results with error handling
        const [
            totalBookingsResult,
            pendingBookingsResult,
            completedBookingsResult,
            ratingsResult,
            recentBookingsResult,
            ...adminMetricsResults
        ] = metrics;

        // Prepare response object with error handling
        const response = {
            totalBookings: totalBookingsResult.status === 'fulfilled' ? totalBookingsResult.value : 0,
            pendingBookings: pendingBookingsResult.status === 'fulfilled' ? pendingBookingsResult.value : 0,
            completedBookings: completedBookingsResult.status === 'fulfilled' ? completedBookingsResult.value : 0,
            averageRating: ratingsResult.status === 'fulfilled' && ratingsResult.value[0] 
                ? ratingsResult.value[0].avg 
                : 0,
            totalReviews: ratingsResult.status === 'fulfilled' && ratingsResult.value[0] 
                ? ratingsResult.value[0].count 
                : 0,
            recentBookings: recentBookingsResult.status === 'fulfilled' 
                ? recentBookingsResult.value 
                : []
        };

        // Add admin-specific metrics if user is admin
        if (userRole === 'admin' && adminMetricsResults.length > 0) {
            const [totalCustomersResult, revenueMetricsResult] = adminMetricsResults;
            
            response.adminMetrics = {
                totalCustomers: totalCustomersResult.status === 'fulfilled' 
                    ? totalCustomersResult.value 
                    : 0,
                totalRevenue: revenueMetricsResult.status === 'fulfilled' && revenueMetricsResult.value[0]
                    ? revenueMetricsResult.value[0].totalRevenue 
                    : 0,
                averageBookingValue: revenueMetricsResult.status === 'fulfilled' && revenueMetricsResult.value[0]
                    ? revenueMetricsResult.value[0].averageBookingValue 
                    : 0
            };
        }

        // Calculate completion rate
        if (response.totalBookings > 0) {
            response.completionRate = ((response.completedBookings / response.totalBookings) * 100).toFixed(1);
        } else {
            response.completionRate = 0;
        }

        res.json(response);

    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard metrics',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add a health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;