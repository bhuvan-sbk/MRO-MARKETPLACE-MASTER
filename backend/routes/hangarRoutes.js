// backend/routes/hangarRoutes.js
const express = require('express');
const Hangar = require('../models/Hangar');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a hangar
router.post('/', auth, async (req, res) => {
  try {
    const hangar = new Hangar({
      ...req.body,
      owner: req.user._id,
      status: 'available' // Default status
    });
    await hangar.save();
    res.status(201).json(hangar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

 
// Route to check hangar data
router.get('/debug/:id', async (req, res) => {
  try {
      const hangar = await Hangar.findById(req.params.id);
      if (!hangar) {
          return res.status(404).json({ error: 'Hangar not found' });
      }
      res.json({
          hangar,
          pricing: {
              hasBasePrice: !!hangar.basePrice,
              basePriceAmount: hangar.basePrice?.amount,
              basePriceCurrency: hangar.basePrice?.currency
          }
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to update hangar pricing
router.post('/update-price/:id', async (req, res) => {
  try {
      const hangar = await Hangar.findByIdAndUpdate(
          req.params.id,
          {
              $set: {
                  basePrice: {
                      amount: 100, // Default hourly rate
                      currency: 'USD'
                  }
              }
          },
          { new: true }
      );

      if (!hangar) {
          return res.status(404).json({ error: 'Hangar not found' });
      }

      res.json({
          success: true,
          hangar,
          message: 'Hangar pricing updated successfully'
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get hangar by ID
// routes/hangarRoutes.js
// routes/hangarRoutes.js

// Get hangar by ID
router.get('/:id', async (req, res) => {
  try {
      const hangar = await Hangar.findById(req.params.id)
          .populate('owner', 'companyName email contactInfo')
          .populate({
              path: 'bookings',
              match: { status: { $ne: 'cancelled' } },
              select: 'startDate endDate status customerId',
              options: { sort: { startDate: -1 } },
              populate: {
                  path: 'customerId',
                  select: 'name email'
              }
          });

      if (!hangar) {
          return res.status(404).json({ error: 'Hangar not found' });
      }

      const response = {
          ...hangar.toJSON(),
          activeBookings: hangar.bookings?.filter(
              booking => ['pending', 'confirmed'].includes(booking.status)
          ) || [],
          isAvailable: hangar.status === 'available' && 
                      (!hangar.bookings || hangar.bookings.every(
                          booking => !['pending', 'confirmed'].includes(booking.status)
                      ))
      };

      res.json(response);
  } catch (error) {
      console.error('Error fetching hangar:', error);
      res.status(500).json({ error: error.message });
  }
});

// Get all hangars (with filters and pagination)
router.get('/', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filters
      const filters = {};
      if (req.query.city) filters['location.city'] = new RegExp(req.query.city, 'i');
      if (req.query.status) filters.status = req.query.status;
      if (req.query.size) filters.size = req.query.size;
      
      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
          filters.pricePerDay = {};
          if (req.query.minPrice) filters.pricePerDay.$gte = Number(req.query.minPrice);
          if (req.query.maxPrice) filters.pricePerDay.$lte = Number(req.query.maxPrice);
      }

      // Execute query with pagination
      const [hangars, total] = await Promise.all([
          Hangar.find(filters)
              .populate('owner', 'companyName email')
              .populate({
                  path: 'bookings',
                  match: { 
                      status: { $in: ['pending', 'confirmed'] },
                      endDate: { $gte: new Date() }
                  },
                  select: 'startDate endDate status'
              })
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit),
          Hangar.countDocuments(filters)
      ]);

      // Add availability status to each hangar
      const hangarsWithStatus = hangars.map(hangar => ({
          ...hangar.toJSON(),
          isAvailable: hangar.status === 'available' && 
                      (!hangar.bookings || hangar.bookings.length === 0)
      }));

      res.json({
          hangars: hangarsWithStatus,
          pagination: {
              total,
              page,
              totalPages: Math.ceil(total / limit),
              hasMore: page * limit < total
          }
      });
  } catch (error) {
      console.error('Error fetching hangars:', error);
      res.status(500).json({ error: error.message });
  }
});

// Update hangar
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'name', 'description', 'size', 'amenities', 
      'pricePerDay', 'location', 'status', 'availability'
    ];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const hangar = await Hangar.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!hangar) {
      return res.status(404).json({ error: 'Hangar not found' });
    }

    updates.forEach(update => {
      hangar[update] = req.body[update];
    });
    await hangar.save();
    res.json(hangar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete hangar
router.delete('/:id', auth, async (req, res) => {
  try {
    const hangar = await Hangar.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!hangar) {
      return res.status(404).json({ error: 'Hangar not found' });
    }

    // Check if hangar has active bookings
    const hasActiveBookings = hangar.bookings?.some(booking => 
      booking.status === 'active' || booking.status === 'pending'
    );

    if (hasActiveBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete hangar with active bookings' 
      });
    }

    await hangar.remove();
    res.json({ message: 'Hangar deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 // routes/hangarRoutes.js
// routes/hangarRoutes.js
// routes/hangarRoutes.js

// Get hangar availability
router.get('/:id/availability', async (req, res) => {
  try {
      console.log('Searching for hangar with ID:', req.params.id);
      
      const hangar = await Hangar.findById(req.params.id);
      
      console.log('Found hangar:', hangar);
      
      if (!hangar) {
          return res.status(404).json({ 
              error: 'Hangar not found',
              searchedId: req.params.id 
          });
      }

      // Initialize availability array if it doesn't exist
      const availability = hangar.availability || [];
      
      // Filter out past dates and sort by start date
      const currentDate = new Date();
      const futureAvailability = availability.filter(slot => 
          new Date(slot.endDate) >= currentDate
      ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      const response = {
          hangarId: hangar._id,
          currentStatus: hangar.status,
          availability: futureAvailability,
          totalSlots: futureAvailability.length
      };

      res.json(response);
  } catch (error) {
      console.error('Error in get availability:', error);
      res.status(500).json({ 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          hangarId: req.params.id
      });
  }
});

// Add availability
router.post('/:id/availability', auth, async (req, res) => {
  try {
      console.log('Adding availability for hangar ID:', req.params.id);
      console.log('User ID:', req.user._id);
      
      const hangar = await Hangar.findOne({
          _id: req.params.id,
          owner: req.user._id
      });

      console.log('Found hangar:', hangar);

      if (!hangar) {
          return res.status(404).json({ 
              error: 'Hangar not found',
              searchedId: req.params.id,
              userId: req.user._id 
          });
      }

      if (!Array.isArray(req.body.availability)) {
          return res.status(400).json({ 
              error: 'Availability must be an array',
              received: req.body 
          });
      }

      // Format and validate dates
      const newAvailability = req.body.availability.map(slot => ({
          startDate: new Date(slot.startDate),
          endDate: new Date(slot.endDate)
      }));

      // Validate dates
      const hasInvalidDates = newAvailability.some(slot => 
          isNaN(slot.startDate) || 
          isNaN(slot.endDate) || 
          slot.startDate >= slot.endDate
      );

      if (hasInvalidDates) {
          return res.status(400).json({ 
              error: 'Invalid dates provided',
              dates: newAvailability
          });
      }

      // Add new availability
      hangar.availability = [...(hangar.availability || []), ...newAvailability];
      await hangar.save();

      res.json({
          message: 'Availability added successfully',
          availability: hangar.availability
      });

  } catch (error) {
      console.error('Error adding availability:', error);
      res.status(500).json({ 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          hangarId: req.params.id
      });
  }
});
module.exports = router;