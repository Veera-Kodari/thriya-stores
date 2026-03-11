const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        originalPrice: {
            type: Number,
            default: null,
        },
        category: {
            type: String,
            required: true,
            enum: ['men', 'women', 'kids'],
        },
        subcategory: {
            type: String,
            required: true,
            enum: [
                'kurtas', 'shirts', 'pants', 'sherwanis', 'lungis', 'jeans',
                'sarees', 'lehengas', 'salwar-suits', 'kurtis', 'dupattas', 'blouses',
                'kids-ethnic', 'kids-casual', 'kids-frocks', 'kids-sets',
                'footwear', 'jewellery', 'accessories',
            ],
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        sizes: {
            type: [String],
            default: [],
        },
        colors: {
            type: [String],
            default: [],
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient filtering
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
