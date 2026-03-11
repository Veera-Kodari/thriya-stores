const express = require('express');
const router = express.Router();
const {
    getProducts,
    getFilterOptions,
    getProduct,
} = require('../controllers/productController');

// Public routes — no auth required for browsing
router.get('/', getProducts);
router.get('/filters', getFilterOptions);
router.get('/:id', getProduct);

module.exports = router;
