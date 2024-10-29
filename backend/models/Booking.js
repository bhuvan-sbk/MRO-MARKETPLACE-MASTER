// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    hangarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hangar',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    aircraft: {
        type: {
            type: String,
            required: [true, 'Aircraft type is required']
        },
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required']
        },
        size: {
            type: String,
            enum: ['small', 'medium', 'large', 'extra-large'],
            required: [true, 'Aircraft size is required']
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    specialRequests: String
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;