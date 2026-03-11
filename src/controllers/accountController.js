/**
 * Account Controller
 * Profile, Addresses, Wishlist, Orders
 */

const User = require('../models/User');
const Order = require('../models/Order');

// ─── PROFILE ──────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, dateOfBirth, profilePic } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, phone, gender, dateOfBirth, profilePic },
            { new: true, runValidators: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        const { profilePic } = req.body; // base64 string
        if (!profilePic) return res.status(400).json({ error: 'No image provided' });
        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePic },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
};

// ─── ADDRESSES ────────────────────────────────────────
const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('addresses');
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const addr = req.body;
        if (addr.isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }
        if (user.addresses.length === 0) addr.isDefault = true;
        user.addresses.push(addr);
        await user.save();
        res.status(201).json(user.addresses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add address' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const addr = user.addresses.id(req.params.addressId);
        if (!addr) return res.status(404).json({ error: 'Address not found' });
        if (req.body.isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }
        Object.assign(addr, req.body);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update address' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.addresses = user.addresses.filter(
            (a) => a._id.toString() !== req.params.addressId
        );
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
};

// ─── WISHLIST ─────────────────────────────────────────
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const productId = req.params.productId;
        const idx = user.wishlist.indexOf(productId);
        if (idx > -1) {
            user.wishlist.splice(idx, 1);
        } else {
            user.wishlist.push(productId);
        }
        await user.save();
        await user.populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
};

// ─── ORDERS ───────────────────────────────────────────
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const placeOrder = async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount, paymentMethod } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }
        const order = await Order.create({
            user: req.userId,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod: paymentMethod || 'COD',
        });
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to place order' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, user: req.userId });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ error: `Cannot cancel ${order.status} order` });
        }
        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePic,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getWishlist,
    toggleWishlist,
    getOrders,
    placeOrder,
    cancelOrder,
};
