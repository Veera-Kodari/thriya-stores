const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const accountRoutes = require('./account');

// Mount route modules
router.use('/', homeRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/account', accountRoutes);

module.exports = router;
