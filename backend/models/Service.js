// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: {
            values: ['maintenance', 'repair', 'inspection', 'cleaning', 'modification', 'certification'],
            message: '{VALUE} is not a valid category'
        }
    },
    duration: {
        value: {
            type: Number,
            required: [true, 'Duration value is required'],
            min: [0, 'Duration cannot be negative']
        },
        unit: {
            type: String,
            required: [true, 'Duration unit is required'],
            enum: {
                values: ['hour', 'day', 'week'], // Changed to singular form
                message: '{VALUE} is not a valid duration unit'
            }
        }
    },
    pricing: {
        value: {
            type: Number,
            required: [true, 'Price value is required'],
            min: [0, 'Price cannot be negative']
        },
        unit: {
            type: String,
            required: [true, 'Pricing unit is required'],
            enum: {
                values: ['flat_rate', 'hourly', 'daily'], // Changed enum values
                message: '{VALUE} is not a valid pricing unit'
            }
        }
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Service provider is required']
    },
    availability: {
        type: Boolean,
        default: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        validUntil: Date
    }],
    supportedAircraftTypes: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'pending_approval'],
            message: '{VALUE} is not a valid status'
        },
        default: 'active'
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;