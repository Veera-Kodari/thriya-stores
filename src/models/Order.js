const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                image: String,
                price: Number,
                qty: Number,
                size: { type: String, default: '' },
            },
        ],
        shippingAddress: {
            fullName: String,
            phone: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            pincode: String,
        },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'placed',
        },
        paymentMethod: { type: String, default: 'COD' },
        orderNumber: { type: String, unique: true },
    },
    { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', function () {
    if (!this.orderNumber) {
        this.orderNumber = 'TS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
