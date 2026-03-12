/**
 * Admin Controller
 * Dashboard stats, product/order/user management
 */
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Middleware: check admin role
const adminOnly = (req, res, next) => {
    // req.userId is set by authMiddleware
    User.findById(req.userId).then((user) => {
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }).catch(() => res.status(500).json({ error: 'Server error' }));
};

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, recentOrders, revenue, ordersByStatus] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: revenue[0]?.total || 0,
            ordersByStatus: ordersByStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
            recentOrders,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// GET /api/admin/orders
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email'),
            Order.countDocuments(filter),
        ]);

        res.json({ orders, total, pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = status;
        order.statusHistory.push({
            status,
            note: note || `Order ${status}`,
            timestamp: new Date(),
        });

        if (status === 'cancelled') {
            order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'pending';
        }

        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        // Also delete reviews for this product
        await Review.deleteMany({ product: req.params.id });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = {
    adminOnly,
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    createProduct,
    updateProduct,
    deleteProduct,
};
