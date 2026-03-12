const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const accountRoutes = require('./account');
const adminRoutes = require('./admin');

// Mount route modules
router.use('/', homeRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
