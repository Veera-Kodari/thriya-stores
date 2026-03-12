const Product = require('../models/Product');
const Review = require('../models/Review');

// GET /api/products — list with filters, search, sort, pagination
const getProducts = async (req, res) => {
    try {
        const {
            category,
            subcategory,
            brand,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 12,
            inStock,
            featured,
        } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (brand) filter.brand = brand;
        if (inStock !== undefined) filter.inStock = inStock === 'true';
        if (featured !== undefined) filter.featured = featured === 'true';

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        let sortOption = { createdAt: -1 };
        switch (sort) {
            case 'price-low': sortOption = { price: 1 }; break;
            case 'price-high': sortOption = { price: -1 }; break;
            case 'rating': sortOption = { rating: -1 }; break;
            case 'newest': sortOption = { createdAt: -1 }; break;
            case 'name-az': sortOption = { name: 1 }; break;
            case 'name-za': sortOption = { name: -1 }; break;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter),
        ]);

        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// GET /api/products/filters
const getFilterOptions = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const [brands, subcategories, priceRange] = await Promise.all([
            Product.distinct('brand', filter),
            Product.distinct('subcategory', filter),
            Product.aggregate([
                { $match: filter },
                { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
            ]),
        ]);

        res.json({
            brands: brands.sort(),
            subcategories: subcategories.sort(),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
};

// GET /api/products/search-suggestions?q=
const searchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ products: [], brands: [] });

        const [products, brands] = await Promise.all([
            Product.find(
                { name: { $regex: q, $options: 'i' } },
                { name: 1, brand: 1, price: 1, image: 1, subcategory: 1 }
            ).limit(6),
            Product.distinct('brand', { brand: { $regex: q, $options: 'i' } }),
        ]);

        res.json({ products, brands: brands.slice(0, 5) });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// GET /api/products/:id/reviews
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name profilePic')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// POST /api/products/:id/reviews (auth required)
const addReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const existing = await Review.findOne({ product: req.params.id, user: req.userId });
        if (existing) {
            existing.rating = rating;
            existing.title = title || '';
            existing.comment = comment || '';
            await existing.save();
            const populated = await existing.populate('user', 'name profilePic');
            return res.json(populated);
        }

        const review = await Review.create({
            product: req.params.id,
            user: req.userId,
            rating,
            title: title || '',
            comment: comment || '',
        });
        const populated = await review.populate('user', 'name profilePic');
        res.status(201).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You already reviewed this product' });
        }
        res.status(500).json({ error: 'Failed to add review' });
    }
};

// GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const related = await Product.find({
            _id: { $ne: product._id },
            $or: [{ subcategory: product.subcategory }, { brand: product.brand }],
        }).limit(8);

        res.json(related);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch related products' });
    }
};

module.exports = { getProducts, getFilterOptions, getProduct, searchSuggestions, getProductReviews, addReview, getRelatedProducts };
