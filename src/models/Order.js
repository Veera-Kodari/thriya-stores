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
        statusHistory: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                note: { type: String, default: '' },
            },
        ],
        paymentMethod: { type: String, enum: ['COD', 'online'], default: 'COD' },
        paymentId: { type: String, default: '' },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
        orderNumber: { type: String, unique: true },
    },
    { timestamps: true }
);

// Auto-generate order number + initial status history
orderSchema.pre('save', function () {
    if (!this.orderNumber) {
        this.orderNumber = 'TS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    }
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({ status: 'placed', note: 'Order placed successfully' });
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
