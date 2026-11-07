const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const imageUrls = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584735175315-9d5df23be8ab?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800',
];

const footwear = [
    ['Coastline Low', 'Sneakers', 89, 120, 'A lightweight everyday sneaker with a breathable knit upper and cushioned sole.', ['everyday', 'knit']],
    ['Metro Court Classic', 'Casual', 99, 135, 'A clean court-inspired low top with durable panels and all-day comfort.', ['court', 'classic']],
    ['Summit Trail Hiker', 'Boots', 159, 199, 'A supportive trail boot with rugged grip and weather-ready construction.', ['trail', 'outdoor']],
    ['Aero Pace Runner', 'Sports', 129, 165, 'Responsive running shoes with a springy midsole and ventilated mesh.', ['running', 'lightweight']],
    ['Monochrome High Top', 'Sneakers', 119, 155, 'A versatile high-top silhouette with padded ankle support and a timeless finish.', ['high-top', 'streetwear']],
    ['Heritage Leather Derby', 'Luxury', 189, 245, 'A refined leather derby with careful stitching and a polished profile.', ['leather', 'formal']],
    ['Cloudstep Slip-On', 'Casual', 79, 105, 'Easy slip-on footwear with a soft lining and flexible everyday sole.', ['slip-on', 'comfort']],
    ['Velocity Court Pro', 'Sports', 139, 179, 'A stable court shoe designed for quick cuts, secure lockdown, and lasting grip.', ['court', 'training']],
    ['Desert Trek Suede', 'Boots', 149, 195, 'A suede chukka boot with a cushioned footbed and dependable traction.', ['suede', 'chukka']],
    ['Prism Street Runner', 'Sneakers', 109, 145, 'A bold street runner combining layered color with lightweight cushioning.', ['streetwear', 'color']],
    ['Everyday Canvas Low', 'Casual', 69, 95, 'A breathable canvas low top made for simple, comfortable daily wear.', ['canvas', 'everyday']],
    ['Carbon Sprint Elite', 'Sports', 199, 255, 'A streamlined performance runner built for fast training sessions.', ['running', 'performance']],
    ['Alpine Waterproof Boot', 'Boots', 179, 229, 'A protective waterproof boot with a grippy outsole for wet-weather walks.', ['waterproof', 'outdoor']],
    ['Studio Leather Court', 'Luxury', 169, 220, 'A premium leather court sneaker with a minimalist, versatile design.', ['leather', 'minimal']],
    ['Retro Track 82', 'Sneakers', 94, 125, 'A retro track-inspired sneaker with a padded collar and flexible sole.', ['retro', 'track']],
    ['Flex Knit Trainer', 'Sports', 115, 150, 'A flexible knit trainer that pairs a breathable upper with stable support.', ['training', 'knit']],
    ['Nightfall Chelsea Boot', 'Luxury', 205, 265, 'A sleek Chelsea boot with elastic side panels and a comfortable inner lining.', ['chelsea', 'leather']],
    ['Harbor Deck Shoe', 'Casual', 89, 118, 'A relaxed deck shoe with a grippy outsole and soft, easy-wear construction.', ['deck', 'casual']],
    ['Canyon Approach Shoe', 'Sports', 145, 189, 'A durable approach shoe with confident traction for rocky paths.', ['trail', 'grip']],
    ['Limited Edition Ember', 'Limited', 225, 290, 'A limited-run statement sneaker with distinctive color blocking and premium details.', ['limited', 'statement']],
    ['City Commute Walker', 'Casual', 99, 132, 'A cushioned walking shoe designed for comfortable days on city streets.', ['walking', 'comfort']],
    ['Courtline Premium Low', 'Sneakers', 129, 170, 'A premium low-top sneaker with a clean profile and supportive padded footbed.', ['court', 'premium']],
    ['Ridgeback Utility Boot', 'Boots', 169, 218, 'A sturdy utility boot with reinforced panels and reliable all-weather grip.', ['utility', 'outdoor']],
    ['Pinnacle Knit Racer', 'Sports', 159, 205, 'A responsive knit racer with a secure fit for long training runs.', ['running', 'knit']],
];

const seedFootwear = async () => {
    try {
        await connectDB();

        const names = footwear.map(([name]) => name);
        const existingNames = new Set(await Product.distinct('name', { name: { $in: names } }));
        const productsToAdd = footwear
            .filter(([name]) => !existingNames.has(name))
            .map(([name, category, price, originalPrice, description, tags], index) => {
                const image = imageUrls[index % imageUrls.length];
                return {
                    name,
                    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-zivo`,
                    brand: 'ZIVO',
                    category,
                    description,
                    image,
                    images: [image],
                    price,
                    originalPrice,
                    countInStock: 24,
                    sizes: [
                        { size: 'UK 7', stock: 6 },
                        { size: 'UK 8', stock: 6 },
                        { size: 'UK 9', stock: 6 },
                        { size: 'UK 10', stock: 6 },
                    ],
                    rating: 0,
                    numReviews: 0,
                    isFeatured: index < 4,
                    isNewArrival: true,
                    tags,
                };
            });

        if (productsToAdd.length > 0) {
            await Product.insertMany(productsToAdd);
        }

        const totalProducts = await Product.countDocuments();
        console.log(`Added ${productsToAdd.length} footwear products with images. Catalog total: ${totalProducts}.`);
    } catch (error) {
        console.error(`Footwear seed failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedFootwear();
