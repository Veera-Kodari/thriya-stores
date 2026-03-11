const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
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
} = require('../controllers/accountController');

// All routes require authentication
router.use(authMiddleware);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/pic', uploadProfilePic);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

// Orders
router.get('/orders', getOrders);
router.post('/orders', placeOrder);
router.put('/orders/:orderId/cancel', cancelOrder);

module.exports = router;
