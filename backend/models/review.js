// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hangarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hangar',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500
    },
    response: {
        comment: {
            type: String,
            trim: true,
            maxlength: 500
        },
        date: Date
    },
    status: {
        type: String,
        enum: ['active', 'hidden', 'reported'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Prevent multiple reviews for the same booking
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });

// Add any methods or statics needed
reviewSchema.methods.hideReview = async function() {
    this.status = 'hidden';
    await this.save();
};

reviewSchema.methods.addResponse = async function(responseText) {
    this.response = {
        comment: responseText,
        date: new Date()
    };
    await this.save();
};

// Static method to get average rating for a hangar
reviewSchema.statics.getAverageRating = async function(hangarId) {
    const result = await this.aggregate([
        {
            $match: {
                hangarId: mongoose.Types.ObjectId(hangarId),
                status: 'active'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Pre-save middleware to validate rating
reviewSchema.pre('save', function(next) {
    if (this.rating < 1 || this.rating > 5) {
        next(new Error('Rating must be between 1 and 5'));
    }
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;