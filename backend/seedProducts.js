const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
    {
        name: 'Neon Runner X Pro',
        brand: 'ZIVO',
        category: 'Sneakers',
        description: 'The pinnacle of performance footwear. Engineered with our proprietary NeoFlex sole technology for unparalleled energy return. A statement piece for those who live on the edge.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'],
        price: 249,
        originalPrice: 320,
        countInStock: 25,
        sizes: [{ size: 'UK 7', stock: 5 }, { size: 'UK 8', stock: 8 }, { size: 'UK 9', stock: 7 }, { size: 'UK 10', stock: 5 }],
        rating: 4.8,
        numReviews: 124,
        isFeatured: true,
        isNewArrival: true,
        tags: ['running', 'neon', 'performance'],
    },
    {
        name: 'Urban Stealth V2',
        brand: 'ZIVO',
        category: 'Sneakers',
        description: 'Minimal. Sleek. Powerful. The Urban Stealth V2 is crafted for the modern metropolitan who demands both style and substance in every step.',
        image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=800'],
        price: 299,
        originalPrice: 380,
        countInStock: 18,
        sizes: [{ size: 'UK 7', stock: 3 }, { size: 'UK 8', stock: 6 }, { size: 'UK 9', stock: 5 }, { size: 'UK 10', stock: 4 }],
        rating: 4.9,
        numReviews: 89,
        isFeatured: true,
        isNewArrival: false,
        tags: ['urban', 'minimal', 'stealth'],
    },
    {
        name: 'Lunar Glide Elite',
        brand: 'ZIVO',
        category: 'Luxury',
        description: 'Inspired by the cosmos, built for Earth. Premium full-grain leather upper with hand-stitched detailing. Each pair is individually numbered, making it a collector\'s piece.',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'],
        price: 449,
        originalPrice: 550,
        countInStock: 8,
        sizes: [{ size: 'UK 7', stock: 2 }, { size: 'UK 8', stock: 3 }, { size: 'UK 9', stock: 2 }, { size: 'UK 10', stock: 1 }],
        rating: 5.0,
        numReviews: 42,
        isFeatured: true,
        isNewArrival: true,
        tags: ['luxury', 'leather', 'premium'],
    },
    {
        name: 'Quantum Boost 360',
        brand: 'ZIVO',
        category: 'Sports',
        description: '360-degree responsive cushioning meets futuristic design. The Quantum Boost features our patented OmniReturn foam that adapts to your gait for peak performance.',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'],
        price: 219,
        originalPrice: 280,
        countInStock: 32,
        sizes: [{ size: 'UK 6', stock: 4 }, { size: 'UK 7', stock: 8 }, { size: 'UK 8', stock: 10 }, { size: 'UK 9', stock: 6 }, { size: 'UK 10', stock: 4 }],
        rating: 4.7,
        numReviews: 156,
        isFeatured: true,
        isNewArrival: false,
        tags: ['sports', 'boost', 'cushion'],
    },
    {
        name: 'Shadow Phantom High',
        brand: 'ZIVO',
        category: 'Sneakers',
        description: 'High-top silhouette reimagined for 2025. Volt-resistant outer shell with reflective paneling for those who move through the city at night.',
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800'],
        price: 329,
        originalPrice: 400,
        countInStock: 14,
        sizes: [{ size: 'UK 7', stock: 3 }, { size: 'UK 8', stock: 5 }, { size: 'UK 9', stock: 4 }, { size: 'UK 10', stock: 2 }],
        rating: 4.6,
        numReviews: 68,
        isFeatured: false,
        isNewArrival: true,
        tags: ['high-top', 'reflective', 'night'],
    },
    {
        name: 'Terra Storm Boot',
        brand: 'ZIVO',
        category: 'Boots',
        description: 'Built for the elements. Waterproof Gore-Tex membrane, Vibram outsole, and premium suede upper. Where utility meets luxury in perfect harmony.',
        image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800'],
        price: 389,
        originalPrice: 480,
        countInStock: 20,
        sizes: [{ size: 'UK 7', stock: 4 }, { size: 'UK 8', stock: 6 }, { size: 'UK 9', stock: 6 }, { size: 'UK 10', stock: 4 }],
        rating: 4.8,
        numReviews: 93,
        isFeatured: false,
        isNewArrival: false,
        tags: ['boots', 'waterproof', 'outdoor'],
    },
    {
        name: 'Velocity Sprint GTX',
        brand: 'ZIVO',
        category: 'Sports',
        description: 'Sub-4 mile training with track-inspired carbon fiber plate and ultra-lightweight mesh. For the athlete who refuses to compromise.',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=800'],
        price: 189,
        originalPrice: 240,
        countInStock: 40,
        sizes: [{ size: 'UK 6', stock: 6 }, { size: 'UK 7', stock: 10 }, { size: 'UK 8', stock: 12 }, { size: 'UK 9', stock: 8 }, { size: 'UK 10', stock: 4 }],
        rating: 4.5,
        numReviews: 210,
        isFeatured: false,
        isNewArrival: false,
        tags: ['running', 'carbon', 'lightweight'],
    },
    {
        name: 'Obsidian Loafer Pro',
        brand: 'ZIVO',
        category: 'Luxury',
        description: 'The modern power shoe. Hand-polished Italian calfskin, gold-plated hardware, memory foam insole. Redefine what it means to arrive in style.',
        image: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=800'],
        price: 599,
        originalPrice: 750,
        countInStock: 6,
        sizes: [{ size: 'UK 7', stock: 1 }, { size: 'UK 8', stock: 2 }, { size: 'UK 9', stock: 2 }, { size: 'UK 10', stock: 1 }],
        rating: 4.9,
        numReviews: 31,
        isFeatured: true,
        isNewArrival: false,
        tags: ['loafer', 'luxury', 'leather', 'gold'],
    },
    {
        name: 'Chrono Drift Slide',
        brand: 'ZIVO',
        category: 'Casual',
        description: 'The elevated casual. Ergonomic arch support meets premium EVA construction. Your off-duty essential, reimagined with ZIVO signature aesthetic.',
        image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=800'],
        price: 129,
        originalPrice: 160,
        countInStock: 50,
        sizes: [{ size: 'UK 6', stock: 10 }, { size: 'UK 7', stock: 12 }, { size: 'UK 8', stock: 15 }, { size: 'UK 9', stock: 8 }, { size: 'UK 10', stock: 5 }],
        rating: 4.4,
        numReviews: 287,
        isFeatured: false,
        isNewArrival: true,
        tags: ['slide', 'casual', 'comfort'],
    },
    {
        name: 'Apex Pinnacle Limited',
        brand: 'ZIVO',
        category: 'Limited',
        description: 'Limited to 500 pairs worldwide. Hand-assembled with aerospace-grade materials. The Apex Pinnacle represents the absolute summit of ZIVO craftsmanship.',
        image: 'https://images.unsplash.com/photo-1584735175315-9d5df23be8ab?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1584735175315-9d5df23be8ab?auto=format&fit=crop&q=80&w=800'],
        price: 899,
        originalPrice: 1100,
        countInStock: 3,
        sizes: [{ size: 'UK 8', stock: 1 }, { size: 'UK 9', stock: 1 }, { size: 'UK 10', stock: 1 }],
        rating: 5.0,
        numReviews: 18,
        isFeatured: true,
        isNewArrival: true,
        tags: ['limited', 'exclusive', 'collector'],
    },
    {
        name: 'Frost Walker Pro',
        brand: 'ZIVO',
        category: 'Boots',
        description: 'Cold never looked so good. Thinsulate insulation rated to -30°C with a plush shearling lining. The Frost Walker is luxury cold-weather footwear redefined.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800&hue-rotate=240',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
        price: 349,
        originalPrice: 440,
        countInStock: 16,
        sizes: [{ size: 'UK 7', stock: 4 }, { size: 'UK 8', stock: 5 }, { size: 'UK 9', stock: 4 }, { size: 'UK 10', stock: 3 }],
        rating: 4.7,
        numReviews: 55,
        isFeatured: false,
        isNewArrival: false,
        tags: ['boots', 'winter', 'insulated'],
    },
    {
        name: 'Aether Cloud Runner',
        brand: 'ZIVO',
        category: 'Sneakers',
        description: 'Step on a cloud. Our most cushioned runner ever, using dual-density CloudCell foam for a sensation unlike any shoe you\'ve worn before. Ethereal comfort, earthly style.',
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800'],
        price: 279,
        originalPrice: 350,
        countInStock: 22,
        sizes: [{ size: 'UK 6', stock: 4 }, { size: 'UK 7', stock: 6 }, { size: 'UK 8', stock: 7 }, { size: 'UK 9', stock: 3 }, { size: 'UK 10', stock: 2 }],
        rating: 4.8,
        numReviews: 112,
        isFeatured: true,
        isNewArrival: true,
        tags: ['cloud', 'cushion', 'runner'],
    },
    {
        name: 'Starlight Suede Slip-On',
        brand: 'ZIVO',
        category: 'Casual',
        description: 'Premium grey suede slip-on featuring intricate star embroidery and signature stitching. Comfort meets celestial style.',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
        images: [],
        price: 149,
        originalPrice: 180,
        countInStock: 25,
        sizes: [{ size: 'UK 7', stock: 5 }, { size: 'UK 8', stock: 8 }, { size: 'UK 9', stock: 7 }],
        rating: 4.8,
        numReviews: 12,
        isFeatured: true,
        isNewArrival: true,
        tags: ['suede', 'slip-on', 'star', 'grey'],
    },
    {
        name: 'Barbed Wire Noir Slip-On',
        brand: 'ZIVO',
        category: 'Casual',
        description: 'Edgy black suede slip-on adorned with custom barbed wire embroidery. A bold statement for everyday wear.',
        image: '/images/login-bg.jpg',
        images: ['/images/login-bg.jpg'],
        price: 159,
        originalPrice: 190,
        countInStock: 15,
        sizes: [{ size: 'UK 7', stock: 3 }, { size: 'UK 8', stock: 5 }, { size: 'UK 9', stock: 4 }],
        rating: 4.9,
        numReviews: 24,
        isFeatured: true,
        isNewArrival: true,
        tags: ['suede', 'slip-on', 'barbed-wire', 'black'],
    },
    {
        name: 'Heritage Double Strap Sandal',
        brand: 'ZIVO',
        category: 'Sandals',
        description: 'Classic brown suede sandal with two adjustable copper buckles and signature ZIVO embossing on the strap.',
        image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=800',
        images: [],
        price: 129,
        originalPrice: 160,
        countInStock: 30,
        sizes: [{ size: 'UK 7', stock: 10 }, { size: 'UK 8', stock: 10 }, { size: 'UK 9', stock: 10 }],
        rating: 4.7,
        numReviews: 45,
        isFeatured: false,
        isNewArrival: true,
        tags: ['sandal', 'brown', 'suede', 'buckle'],
    },
    {
        name: 'Starlight Suede Slip-On (Alternate)',
        brand: 'ZIVO',
        category: 'Casual',
        description: 'Premium grey suede slip-on with star embroidery, viewed from an alternate angle to showcase the intricate toe stitching.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        images: [],
        price: 149,
        originalPrice: 180,
        countInStock: 20,
        sizes: [{ size: 'UK 7', stock: 5 }, { size: 'UK 8', stock: 8 }, { size: 'UK 9', stock: 7 }],
        rating: 4.6,
        numReviews: 8,
        isFeatured: false,
        isNewArrival: true,
        tags: ['suede', 'slip-on', 'star', 'grey'],
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany({});
        console.log('✓ Products cleared');

        // Check if admin exists, create if not
        let adminUser = await User.findOne({ email: 'admin@zivo.com' });
        if (!adminUser) {
            adminUser = await User.findOne({ email: 'admin@quirks.com', isAdmin: true });
            if (adminUser) {
                adminUser.email = 'admin@zivo.com';
                await adminUser.save();
                console.log('✓ Existing admin login updated to admin@zivo.com');
            }
        }

        if (!adminUser) {
            adminUser = await User.create({
                name: 'ZIVO Admin',
                email: 'admin@zivo.com',
                password: 'admin123',
                isAdmin: true,
            });
            console.log('✓ Admin user created: admin@zivo.com / admin123');
        } else {
            console.log('✓ Admin user already exists');
        }

        // Seed products
        const productsWithSlug = products.map(p => ({
            ...p,
            slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }));
        await Product.insertMany(productsWithSlug);
        console.log(`✓ ${products.length} products seeded successfully`);
        console.log('\n🎉 Database seeded! You can now start the server.\n');
        console.log('Admin credentials: admin@zivo.com / admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedData();
