const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true, maxlength: 100 },
        comment: { type: String, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to recalculate product rating
reviewSchema.statics.calcAverageRating = async function (productId) {
    const Product = mongoose.model('Product');
    const stats = await this.aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    } else {
        await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
    }
};

// Recalculate after save/remove
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});
reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) doc.constructor.calcAverageRating(doc.product);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
