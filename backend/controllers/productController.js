const Product = require('../models/Product');
const normalizeImageUrl = require('../utils/imageUrl');
const { normalizeImageUrls } = require('../utils/imageUrl');

// @desc    Fetch all products (with search & filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 12;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? { name: { $regex: req.query.keyword, $options: 'i' } }
            : {};
        const category = req.query.category && req.query.category !== 'All'
            ? { category: req.query.category }
            : {};
        const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
        const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};

        const filter = { ...keyword, ...category, ...minPrice, ...maxPrice };

        let sortOption = {};
        if (req.query.sort === 'price_asc') sortOption = { price: 1 };
        else if (req.query.sort === 'price_desc') sortOption = { price: -1 };
        else if (req.query.sort === 'newest') sortOption = { createdAt: -1 };
        else if (req.query.sort === 'rating') sortOption = { rating: -1 };
        else sortOption = { createdAt: -1 };

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true }).limit(6);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, image, images, brand, category, countInStock, description, sizes, isFeatured, isNewArrival, tags } = req.body;
        const imageUrl = normalizeImageUrl(image);
        const imageUrls = normalizeImageUrls(images);

        const product = new Product({
            name: name || 'New Product',
            price: price || 0,
            originalPrice: originalPrice || 0,
            image: imageUrl,
            images: imageUrls,
            brand: brand || 'ZIVO',
            category: category || 'Sneakers',
            countInStock: countInStock || 0,
            description: description || 'Product description',
            sizes: sizes || [],
            isFeatured: isFeatured || false,
            isNewArrival: isNewArrival || false,
            tags: tags || [],
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error', error: error.statusCode ? undefined : error.message });
    }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, image, images, brand, category, countInStock, description, sizes, isFeatured, isNewArrival, tags } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imageUrl = image === undefined ? undefined : normalizeImageUrl(image);
        const imageUrls = images === undefined ? undefined : normalizeImageUrls(images);

        product.name = name ?? product.name;
        product.price = price ?? product.price;
        product.originalPrice = originalPrice ?? product.originalPrice;
        product.image = imageUrl ?? product.image;
        product.images = imageUrls ?? product.images;
        product.brand = brand ?? product.brand;
        product.category = category ?? product.category;
        product.countInStock = countInStock ?? product.countInStock;
        product.description = description ?? product.description;
        product.sizes = sizes ?? product.sizes;
        product.isFeatured = isFeatured ?? product.isFeatured;
        product.isNewArrival = isNewArrival ?? product.isNewArrival;
        product.tags = tags ?? product.tags;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error', error: error.statusCode ? undefined : error.message });
    }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getFeaturedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
};
