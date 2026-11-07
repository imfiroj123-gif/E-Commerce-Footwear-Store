const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    brand: { type: String, required: true, default: 'ZIVO' },
    category: {
        type: String,
        required: true,
        enum: ['Sneakers', 'Boots', 'Luxury', 'Sports', 'Casual', 'Limited'],
        default: 'Sneakers'
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    sizes: [{
        size: { type: String },
        stock: { type: Number, default: 0 }
    }],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    tags: [{ type: String }],
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre('save', function () {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
