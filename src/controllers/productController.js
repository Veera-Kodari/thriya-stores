const Product = require('../models/Product');

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

        // Sort options
        let sortOption = { createdAt: -1 };
        switch (sort) {
            case 'price-low':
                sortOption = { price: 1 };
                break;
            case 'price-high':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'name-az':
                sortOption = { name: 1 };
                break;
            case 'name-za':
                sortOption = { name: -1 };
                break;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
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

// GET /api/products/filters — get available filter options
const getFilterOptions = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const [brands, subcategories, priceRange] = await Promise.all([
            Product.distinct('brand', filter),
            Product.distinct('subcategory', filter),
            Product.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                    },
                },
            ]),
        ]);

        res.json({
            brands: brands.sort(),
            subcategories: subcategories.sort(),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
        });
    } catch (error) {
        console.error('getFilterOptions error:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('getProduct error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

module.exports = { getProducts, getFilterOptions, getProduct };
