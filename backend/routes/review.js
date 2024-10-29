// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const auth = require('../middleware/auth');
const Booking = require('../models/booking');

// Create a review
router.post('/', auth, async (req, res) => {
    try {
        // Verify booking exists and belongs to user
        const booking = await Booking.findOne({
            _id: req.body.bookingId,
            customerId: req.user._id,
            status: 'completed'
        });

        if (!booking) {
            return res.status(404).json({ 
                error: 'Booking not found or not eligible for review' 
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            bookingId: req.body.bookingId,
            userId: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ 
                error: 'Review already exists for this booking' 
            });
        }

        const review = new Review({
            ...req.body,
            userId: req.user._id,
            hangarId: booking.hangarId
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get reviews for a hangar
router.get('/hangar/:hangarId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({
            hangarId: req.params.hangarId,
            status: 'active'
        })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Review.countDocuments({
            hangarId: req.params.hangarId,
            status: 'active'
        });

        res.json({
            reviews,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate('hangarId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update review
router.patch('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const updates = ['rating', 'comment'];
        updates.forEach(update => {
            if (req.body[update]) {
                review[update] = req.body[update];
            }
        });

        await review.save();
        res.json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add response to review (for hangar owners)
router.post('/:id/response', auth, async (req, res) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            status: 'active'
        }).populate('hangarId');

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Verify the user is the hangar owner
        if (review.hangarId.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await review.addResponse(req.body.response);
        res.json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Report review
router.post('/:id/report', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        review.status = 'reported';
        await review.save();
        res.json({ message: 'Review reported successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;