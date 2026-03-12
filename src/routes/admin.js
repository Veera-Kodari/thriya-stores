const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    adminOnly,
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
