const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getProducts,
    getFilterOptions,
    getProduct,
    searchSuggestions,
    getProductReviews,
    addReview,
    getRelatedProducts,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/filters', getFilterOptions);
router.get('/search-suggestions', searchSuggestions);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);
router.get('/:id/related', getRelatedProducts);

// Protected routes
router.post('/:id/reviews', authMiddleware, addReview);

module.exports = router;
