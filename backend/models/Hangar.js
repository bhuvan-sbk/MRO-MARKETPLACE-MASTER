// models/Hangar.js
const mongoose = require('mongoose');

const hangarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        address: String,
        city: String,
        country: String
    },
    // Using basePrice instead of price to match your existing data
    basePrice: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    specifications: {
        size: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                default: 'meters'
            }
        }
    }
}, {
    timestamps: true
});

// Indexes
hangarSchema.index({ 'location.city': 1 });
hangarSchema.index({ status: 1 });
hangarSchema.index({ pricePerDay: 1 });
hangarSchema.index({ owner: 1 });

// Virtual for bookings
hangarSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'hangarId',
    options: { sort: { createdAt: -1 } }
});

// Pre-save middleware to validate dates
hangarSchema.pre('save', function(next) {
    if (this.availability && this.availability.length > 0) {
        const hasInvalidDates = this.availability.some(slot => 
            slot.startDate >= slot.endDate
        );
        
        if (hasInvalidDates) {
            next(new Error('End date must be after start date for all availability slots'));
        }
    }
    next();
});

const Hangar = mongoose.model('Hangar', hangarSchema);

module.exports = Hangar;