// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Hangar = require('../models/Hangar');
const auth = require('../middleware/auth');

 
router.post('/', auth, async (req, res) => {
    try {
        // Get and validate hangar
        const hangar = await Hangar.findById(req.body.hangarId);
        
        console.log('Found hangar:', hangar); // Debug log

        if (!hangar) {
            return res.status(404).json({ error: 'Hangar not found' });
        }

        // Validate hangar pricing
        if (!hangar.basePrice || typeof hangar.basePrice.amount !== 'number') {
            console.log('Hangar pricing:', hangar.basePrice); // Debug log
            return res.status(400).json({ 
                error: 'Invalid hangar pricing configuration',
                details: 'Hangar price is not properly configured',
                hangarData: {
                    id: hangar._id,
                    basePrice: hangar.basePrice
                }
            });
        }

        // Create booking
        const booking = new Booking({
            hangarId: req.body.hangarId,
            customerId: req.user._id,
            startDate,
            endDate,
            totalPrice,
            aircraft: {
                type: req.body.aircraft.type,
                registrationNumber: req.body.aircraft.registrationNumber,
                size: req.body.aircraft.size
            },
            status: 'pending',
            paymentStatus: 'pending',
            specialRequests: req.body.specialRequests
        });

        await booking.save();

        // Populate booking data
        await booking.populate([
            { path: 'hangarId', select: 'name location price' },
            { path: 'customerId', select: 'name email' }
        ]);

        res.status(201).json({
            booking,
            summary: {
                duration: durationHours,
                pricePerHour: hangar.price.amount,
                totalPrice,
                dates: {
                    start: startDate,
                    end: endDate
                }
            }
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ 
            message: 'Error creating booking', 
            error: error.message
        });
    }
});


// Add this route to update hangar pricing
router.patch('/:id/price', auth, async (req, res) => {
    try {
        const hangar = await Hangar.findById(req.params.id);
        if (!hangar) {
            return res.status(404).json({ error: 'Hangar not found' });
        }

        // Update pricing
        hangar.price = {
            amount: req.body.amount,
            currency: req.body.currency || 'USD'
        };

        await hangar.save();
        res.json(hangar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

     
 
// Get all bookings for current user
router.get('/customer', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('hangarId', 'name location')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id
        }).populate('hangarId', 'name location');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;