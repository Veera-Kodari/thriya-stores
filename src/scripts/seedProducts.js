const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

// ===============================================================
//  RELIABLE IMAGE POOLS (verified working Unsplash photo IDs)
// ===============================================================
const IMG = {
  saree: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1609748340878-aec2e10e3c41?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=520&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop&q=80',
  ],
  lehenga: [
    'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=520&fit=crop&q=80',
  ],
  salwar: [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1609748340878-aec2e10e3c41?w=400&h=520&fit=crop',
  ],
  kurti: [
    'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1609748340878-aec2e10e3c41?w=400&h=520&fit=crop',
  ],
  dupatta: [
    'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=520&fit=crop',
  ],
  blouse: [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
  ],
  jewellery: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1515562141589-67f0d724768b?w=400&h=520&fit=crop',
  ],
  kurta: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop&q=80',
  ],
  sherwani: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=520&fit=crop&q=80',
  ],
  shirt: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=520&fit=crop',
  ],
  pants: [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=520&fit=crop',
  ],
  jeans: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=520&fit=crop',
  ],
  lungi: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
  ],
  footwear: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=520&fit=crop',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=520&fit=crop',
  ],
  kids: [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&h=520&fit=crop',
  ],
  tshirt: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=520&fit=crop',
  ],
  blazer: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=520&fit=crop',
    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=520&fit=crop',
  ],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randRating() { return +(3.5 + Math.random() * 1.5).toFixed(1); }
function randReviews() { return randBetween(15, 3500); }
function maybeOrigPrice(price) { return Math.random() > 0.35 ? Math.round(price * (1.3 + Math.random() * 0.5)) : null; }

// ===============================================================
//  SAREE GENERATION - 400 unique sarees
// ===============================================================
const sareeTypes = [
  'Banarasi Silk', 'Kanjivaram Pure Silk', 'Chanderi Cotton', 'Pochampally Ikat',
  'Mysore Crepe Silk', 'Paithani Silk', 'Tussar Silk', 'Bhagalpuri Silk',
  'Gadwal Silk', 'Uppada Silk', 'Patola Double Ikat', 'Bandhani Tie-Dye',
  'Sambalpuri Ikat', 'Tant Cotton', 'Muga Silk', 'Chiffon Printed',
  'Georgette Embroidered', 'Organza Floral', 'Net Party Wear', 'Crepe De Chine',
  'Linen Handloom', 'Jamdani Muslin', 'Bomkai Silk', 'Nauvari Maharashtra',
  'Ilkal Karnataka', 'Kota Doria', 'Maheshwari Silk Cotton', 'Baluchari',
  'Kasavu Kerala', 'Phulkari Punjab', 'Kalamkari Hand-Painted', 'Patan Patola',
  'Khadi Cotton', 'Sico Handloom', 'Murshidabad Silk', 'Venkatagiri Cotton',
  'Mangalagiri Cotton', 'Dharmavaram Silk', 'Molakalmuru Silk', 'Eri Silk',
];

const sareeDesigns = [
  'with Traditional Gold Zari Border', 'with Contrast Pallu', 'with Temple Motifs',
  'with Floral Jaal Work', 'with Peacock Design', 'with Paisley Pattern',
  'with Butis All Over', 'with Geometric Patterns', 'with Elephant Motifs',
  'with Mango Design', 'with Checks Pattern', 'with Stripes Design',
  'with Heavy Pallu', 'with Running Blouse', 'with Sequin Border',
  'with Mirror Work', 'with Resham Embroidery', 'with Stone Work',
  'with Cutwork Border', 'with Tassel Details',
];

const sareeOccasions = [
  'Wedding Collection', 'Festival Special', 'Daily Wear', 'Office Wear',
  'Puja Special', 'Party Wear', 'Bridal Collection', 'Reception Wear',
  'Mehendi Ceremony', 'Sangeet Night',
];

const sareeColors = [
  ['Red & Gold', 'Maroon & Gold', 'Royal Blue & Gold'],
  ['Green & Magenta', 'Purple & Silver', 'Orange & Yellow'],
  ['Teal & Gold', 'Wine & Cream', 'Navy & Silver'],
  ['Pink & Green', 'Mustard & Maroon', 'Peach & Gold'],
  ['Black & Gold', 'Ivory & Red', 'Sea Green & Orange'],
  ['Coral & Gold', 'Lavender & Silver', 'Off-White & Gold'],
  ['Rust & Teal', 'Plum & Gold', 'Emerald & Gold'],
  ['Turquoise & Red', 'Beige & Brown', 'Magenta & Gold'],
];

const sareeBrands = [
  'Kanchivaram Silks', 'Fabindia', 'Handloom House', 'Mysore Silks',
  'Nalli Silks', 'RMKV Silks', 'Chennai Silks', 'Pothy\'s',
  'Sundari Silks', 'Jayalakshmi Silks', 'Kalyan Silks', 'Seematti',
];

const sareePriceRanges = {
  'Silk': [4999, 25000], 'Cotton': [999, 3999], 'Handloom': [1999, 8999],
  'Chiffon': [1499, 4999], 'Georgette': [1999, 6999], 'Organza': [2499, 7999],
  'Net': [1999, 5999], 'Crepe': [1499, 4999], 'Linen': [1299, 3999],
  'Muslin': [1999, 5999], 'Khadi': [999, 2999], 'Sico': [2999, 9999],
};

function getSareePrice(typeName) {
  for (const [key, range] of Object.entries(sareePriceRanges)) {
    if (typeName.includes(key)) return randBetween(range[0], range[1]);
  }
  return randBetween(1999, 9999);
}

const sareeDescriptions = [
  'Exquisite handwoven masterpiece with intricate zari work. Rich pallu with traditional motifs. Perfect for weddings and festivals.',
  'Authentic handloom saree crafted by master weavers. Pure fabric with contrast border and grand pallu. Temple-inspired motifs.',
  'Lightweight and elegant saree with delicate butis. Sheer texture with golden border. Ideal for summer and daily puja wear.',
  'Handcrafted saree with geometric patterns. Traditional weave technique passed through generations. GI tagged authentic craft.',
  'Elegant saree with minimal yet sophisticated design. Easy to drape and comfortable. Perfect for office and casual occasions.',
  'Special occasion saree with peacock pallu. Handwoven with real zari. Heirloom quality bridal wear.',
  'Vibrant tie-dye saree with traditional Bandhani pattern. Rich colour palette with mirror work border. Festival special.',
  'Contemporary design meets traditional weaving. Soft drape with modern colour palette. Versatile for any occasion.',
  'Premium quality saree with rich texture and lustrous finish. Designed for the modern Indian woman. Goes from desk to dinner.',
  'Classic heritage saree with timeless appeal. Intricate border work with elegant motifs. A wardrobe must-have.',
];

function generateSarees() {
  const products = [];
  const usedNames = new Set();
  for (const type of sareeTypes) {
    for (const design of sareeDesigns) {
      const name = `${type} Saree ${design}`;
      if (usedNames.has(name)) continue;
      usedNames.add(name);
      const occasion = pick(sareeOccasions);
      const price = getSareePrice(type);
      products.push({
        name,
        description: `${pick(sareeDescriptions)} ${occasion}.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'sarees',
        brand: pick(sareeBrands),
        image: pick(IMG.saree),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['Free Size'],
        colors: pick(sareeColors),
        inStock: Math.random() > 0.05,
        featured: Math.random() > 0.88,
        tags: name.toLowerCase().split(' ').filter(w => w.length > 2).concat(['saree', occasion.toLowerCase().split(' ')[0]]),
      });
      if (products.length >= 400) break;
    }
    if (products.length >= 400) break;
  }
  return products;
}

// ===============================================================
//  MEN'S COLLECTION - ~400 unique items
// ===============================================================
const mensBrands = [
  'Manyavar', 'Fabindia', 'Peter England', 'Allen Solly',
  'Raymond', 'Van Heusen', 'Louis Philippe', 'Arrow',
  'Park Avenue', 'Ramraj Cotton', 'Siyaram', 'Biba Men',
];

function generateMensCollection() {
  const products = [];

  // --- Kurtas (60) ---
  const kurtaFabrics = ['Silk', 'Cotton', 'Linen', 'Khadi', 'Jacquard', 'Chanderi'];
  const kurtaStyles = ['Straight Cut', 'A-Line', 'Pathani', 'Angrakha', 'Short', 'Lucknowi Chikan', 'Nehru Collar', 'Band Collar', 'Chinese Collar', 'Mandarin Collar'];
  for (const fabric of kurtaFabrics) {
    for (const style of kurtaStyles) {
      const name = `${style} ${fabric} Kurta`;
      const price = randBetween(999, 5999);
      products.push({
        name,
        description: `Premium ${fabric.toLowerCase()} kurta in ${style.toLowerCase()} design. Perfect for festivals, weddings and daily ethnic wear. Comfortable fit with fine craftsmanship.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'kurtas',
        brand: pick(mensBrands),
        image: pick(IMG.kurta),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: pick([['White', 'Cream', 'Gold'], ['Navy', 'Black', 'Maroon'], ['Sky Blue', 'Olive', 'Peach']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [fabric.toLowerCase(), style.toLowerCase(), 'kurta', 'ethnic', 'men'],
      });
    }
  }

  // --- Shirts (90) ---
  const shirtTypes = ['Formal', 'Casual', 'Slim Fit', 'Regular Fit', 'Oxford', 'Mandarin Collar'];
  const shirtFabrics = ['Cotton', 'Linen', 'Polyester Blend', 'Chambray', 'Denim'];
  const shirtPatterns = ['Solid', 'Striped', 'Checked'];
  for (const type of shirtTypes) {
    for (const fabric of shirtFabrics) {
      for (const pattern of shirtPatterns) {
        const name = `${type} ${pattern} ${fabric} Shirt`;
        const price = randBetween(799, 2999);
        products.push({
          name,
          description: `${type} ${pattern.toLowerCase()} shirt in premium ${fabric.toLowerCase()}. Modern fit with attention to detail. Perfect for office and smart casual occasions.`,
          price,
          originalPrice: maybeOrigPrice(price),
          category: 'men',
          subcategory: 'shirts',
          brand: pick(mensBrands),
          image: pick(IMG.shirt),
          rating: randRating(),
          reviewCount: randReviews(),
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: pick([['White', 'Blue', 'Black'], ['Navy', 'Grey', 'Wine'], ['Pink', 'Lavender', 'Mint']]),
          inStock: true, featured: Math.random() > 0.92,
          tags: [type.toLowerCase(), pattern.toLowerCase(), fabric.toLowerCase(), 'shirt', 'men'],
        });
      }
    }
  }

  // --- T-Shirts (60) ---
  const tshirtStyles = ['Round Neck', 'V-Neck', 'Polo', 'Henley', 'Oversized', 'Graphic'];
  const tshirtFabrics = ['Cotton', 'Polyester', 'Tri-blend', 'Organic Cotton', 'Bamboo Blend'];
  const tshirtPatterns = ['Solid', 'Printed'];
  for (const style of tshirtStyles) {
    for (const fabric of tshirtFabrics) {
      for (const pattern of tshirtPatterns) {
        const name = `${style} ${pattern} ${fabric} T-Shirt`;
        const price = randBetween(399, 1999);
        products.push({
          name,
          description: `Comfortable ${style.toLowerCase()} t-shirt in ${fabric.toLowerCase()}. ${pattern} design. Perfect for casual outings and daily wear.`,
          price,
          originalPrice: maybeOrigPrice(price),
          category: 'men',
          subcategory: 't-shirts',
          brand: pick(mensBrands),
          image: pick(IMG.tshirt),
          rating: randRating(),
          reviewCount: randReviews(),
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: pick([['Black', 'White', 'Grey'], ['Navy', 'Olive', 'Maroon'], ['Red', 'Blue', 'Yellow']]),
          inStock: true, featured: Math.random() > 0.93,
          tags: [style.toLowerCase(), fabric.toLowerCase(), 'tshirt', 'casual', 'men'],
        });
      }
    }
  }

  // --- Pants (54) ---
  const pantsTypes = ['Slim Fit', 'Regular Fit', 'Relaxed Fit'];
  const pantsFabrics = ['Cotton Chino', 'Linen', 'Polyester Blend', 'Stretch Cotton', 'Cargo', 'Jogger'];
  const pantsColors = ['Solid', 'Textured', 'Pleated'];
  for (const type of pantsTypes) {
    for (const fabric of pantsFabrics) {
      for (const style of pantsColors) {
        const name = `${type} ${style} ${fabric} Trousers`;
        const price = randBetween(899, 2999);
        products.push({
          name,
          description: `Smart ${type.toLowerCase()} trousers in ${fabric.toLowerCase()}. ${style} finish. Versatile for office and casual wear.`,
          price,
          originalPrice: maybeOrigPrice(price),
          category: 'men',
          subcategory: 'pants',
          brand: pick(mensBrands),
          image: pick(IMG.pants),
          rating: randRating(),
          reviewCount: randReviews(),
          sizes: ['28', '30', '32', '34', '36', '38'],
          colors: pick([['Khaki', 'Navy', 'Black'], ['Olive', 'Grey', 'Brown'], ['Beige', 'Charcoal', 'Wine']]),
          inStock: true, featured: Math.random() > 0.92,
          tags: [type.toLowerCase(), fabric.toLowerCase(), 'trousers', 'pants', 'men'],
        });
      }
    }
  }

  // --- Jeans (48) ---
  const jeansFits = ['Slim', 'Skinny', 'Straight', 'Relaxed', 'Tapered', 'Bootcut'];
  const jeansWash = ['Dark Indigo', 'Medium Wash', 'Light Wash', 'Black Denim', 'Grey Denim', 'Ripped Distressed', 'Raw Denim', 'Acid Wash'];
  for (const fit of jeansFits) {
    for (const wash of jeansWash) {
      const name = `${fit} Fit ${wash} Jeans`;
      const price = randBetween(1299, 3499);
      products.push({
        name,
        description: `${fit} fit jeans in ${wash.toLowerCase()} finish. Premium denim with slight stretch for all-day comfort. Essential men's wardrobe staple.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'jeans',
        brand: pick(mensBrands),
        image: pick(IMG.jeans),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: [wash],
        inStock: true, featured: Math.random() > 0.9,
        tags: [fit.toLowerCase(), wash.toLowerCase(), 'jeans', 'denim', 'men'],
      });
    }
  }

  // --- Sherwanis (30) ---
  const sherwaniStyles = ['Royal Embroidered', 'Jodhpuri Bandhgala', 'Indo-Western', 'Nehru Jacket Style', 'Angrakha', 'Classic'];
  const shervaniFabrics = ['Silk', 'Brocade', 'Jacquard', 'Velvet', 'Art Silk'];
  for (const style of sherwaniStyles) {
    for (const fabric of shervaniFabrics) {
      const name = `${style} ${fabric} Sherwani`;
      const price = randBetween(5999, 19999);
      products.push({
        name,
        description: `Grand ${style.toLowerCase()} sherwani in premium ${fabric.toLowerCase()}. Perfect for groom, wedding and reception occasions. Includes churidar.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'sherwanis',
        brand: pick(['Manyavar', 'Raymond', 'Rajwada Fashion', 'Fabindia']),
        image: pick(IMG.sherwani),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: pick([['Ivory', 'Gold', 'Maroon'], ['Black', 'Navy', 'Wine'], ['Cream', 'Silver', 'Royal Blue']]),
        inStock: Math.random() > 0.1, featured: Math.random() > 0.85,
        tags: [style.toLowerCase(), fabric.toLowerCase(), 'sherwani', 'wedding', 'groom', 'men'],
      });
    }
  }

  // --- Blazers (24) ---
  const blazerStyles = ['Single Breasted', 'Double Breasted', 'Nehru Jacket', 'Casual'];
  const blazerFabrics = ['Wool Blend', 'Linen', 'Cotton', 'Velvet', 'Tweed', 'Polyester'];
  for (const style of blazerStyles) {
    for (const fabric of blazerFabrics) {
      const name = `${style} ${fabric} Blazer`;
      const price = randBetween(2999, 8999);
      products.push({
        name,
        description: `Sophisticated ${style.toLowerCase()} blazer in ${fabric.toLowerCase()}. Tailored fit with modern detailing. Perfect for formal events and smart casual occasions.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'blazers',
        brand: pick(mensBrands),
        image: pick(IMG.blazer),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: pick([['Black', 'Navy', 'Charcoal'], ['Brown', 'Olive', 'Burgundy']]),
        inStock: true, featured: Math.random() > 0.88,
        tags: [style.toLowerCase(), fabric.toLowerCase(), 'blazer', 'formal', 'men'],
      });
    }
  }

  // --- Lungis & Dhotis (12) ---
  const lungiTypes = ['Cotton Mundu', 'Silk Dhoti', 'Printed Lungi', 'Kasavu Mundu', 'Colour Lungi', 'Handloom Dhoti'];
  const lungiStyles = ['with Golden Border', 'with Zari Border'];
  for (const type of lungiTypes) {
    for (const style of lungiStyles) {
      const name = `${type} ${style}`;
      const price = type.includes('Silk') ? randBetween(1999, 4999) : randBetween(399, 1499);
      products.push({
        name,
        description: `Traditional ${type.toLowerCase()} ${style.toLowerCase()}. Essential South Indian ethnic wear for temple, puja and daily use. Comfortable and classic.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'lungis',
        brand: pick(['Ramraj Cotton', 'Kanchivaram Silks', 'Fabindia']),
        image: pick(IMG.lungi),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['Free Size'],
        colors: pick([['White & Gold', 'Cream & Gold'], ['White & Maroon', 'White & Green']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [type.toLowerCase().split(' ')[0], 'lungi', 'dhoti', 'traditional', 'men'],
      });
    }
  }

  // --- Men's Footwear (15) ---
  const footwearTypes = ['Kolhapuri Chappal', 'Mojari Juttis', 'Leather Sandals', 'Formal Oxford Shoes', 'Casual Loafers'];
  const footwearMaterials = ['Genuine Leather', 'Vegan Leather', 'Suede'];
  for (const type of footwearTypes) {
    for (const material of footwearMaterials) {
      const name = `${material} ${type}`;
      const price = randBetween(799, 3999);
      products.push({
        name,
        description: `Handcrafted ${material.toLowerCase()} ${type.toLowerCase()}. Premium quality with cushioned sole. Traditional Indian footwear with modern comfort.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'footwear',
        brand: pick(['Kolhapuri Craft', 'Rajwada Fashion', 'Bata', 'Woodland']),
        image: pick(IMG.footwear),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['6', '7', '8', '9', '10', '11'],
        colors: pick([['Tan', 'Brown', 'Black'], ['Maroon', 'Gold', 'Black']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [type.toLowerCase().split(' ')[0], material.toLowerCase().split(' ')[0], 'footwear', 'men'],
      });
    }
  }

  // --- Men's Accessories (12) ---
  const accessoryTypes = ['Silk Pocket Square', 'Brooch Set', 'Turban (Safa)', 'Cufflinks Set', 'Tie & Pocket Square Set', 'Leather Belt'];
  const accessoryStyles = ['Traditional', 'Modern'];
  for (const type of accessoryTypes) {
    for (const style of accessoryStyles) {
      const name = `${style} ${type}`;
      const price = randBetween(299, 2499);
      products.push({
        name,
        description: `${style} ${type.toLowerCase()} for the well-dressed gentleman. Elevate your ethnic or formal look with this premium accessory.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'men',
        subcategory: 'accessories',
        brand: pick(mensBrands),
        image: pick(IMG.accessories),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: type.includes('Belt') ? ['S', 'M', 'L', 'XL'] : [],
        colors: pick([['Gold', 'Silver', 'Black'], ['Maroon', 'Navy', 'White']]),
        inStock: true, featured: Math.random() > 0.92,
        tags: [type.toLowerCase().split(' ')[0], style.toLowerCase(), 'accessories', 'men'],
      });
    }
  }

  return products;
}

// ===============================================================
//  WOMEN'S OTHER (Non-Saree) - ~155 items
// ===============================================================
const womensBrands = [
  'Sabyasachi Style', 'Meena Bazaar', 'W for Woman', 'Biba', 'Fabindia',
  'Rajwada Fashion', 'Tanishq Style', 'Silver Street', 'Aurelia', 'Global Desi',
];

function generateWomensOther() {
  const products = [];

  // --- Lehengas (30) ---
  const lehengaTypes = ['Bridal Heavy', 'Mirror Work', 'Pastel Party Wear', 'A-Line', 'Mermaid Cut', 'Flared Ghagra'];
  const lehengaFabrics = ['Raw Silk', 'Georgette', 'Net', 'Velvet', 'Art Silk'];
  for (const type of lehengaTypes) {
    for (const fabric of lehengaFabrics) {
      const name = `${type} ${fabric} Lehenga Choli`;
      const price = randBetween(3999, 24999);
      products.push({
        name,
        description: `Stunning ${type.toLowerCase()} lehenga in ${fabric.toLowerCase()} with embroidery and sequin work. Includes matching choli and net dupatta. Wedding and festival collection.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'lehengas',
        brand: pick(womensBrands),
        image: pick(IMG.lehenga),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['S', 'M', 'L', 'XL'],
        colors: pick([['Red', 'Maroon', 'Pink'], ['Lavender', 'Mint', 'Peach'], ['Orange', 'Blue', 'Green']]),
        inStock: Math.random() > 0.05, featured: Math.random() > 0.85,
        tags: [type.toLowerCase().split(' ')[0], fabric.toLowerCase(), 'lehenga', 'women'],
      });
    }
  }

  // --- Salwar Suits (20) ---
  const salwarTypes = ['Anarkali', 'Patiala', 'Palazzo', 'Straight Cut', 'Churidar'];
  const salwarFabrics = ['Georgette', 'Cotton', 'Chanderi', 'Rayon'];
  for (const type of salwarTypes) {
    for (const fabric of salwarFabrics) {
      const name = `${type} ${fabric} Salwar Suit`;
      const price = randBetween(1499, 7999);
      products.push({
        name,
        description: `Elegant ${type.toLowerCase()} suit in ${fabric.toLowerCase()} with matching dupatta. Comfortable and stylish for festive and daily wear.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'salwar-suits',
        brand: pick(womensBrands),
        image: pick(IMG.salwar),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: pick([['Wine', 'Teal', 'Mustard'], ['White & Gold', 'Navy & Silver', 'Black & Red']]),
        inStock: true, featured: Math.random() > 0.88,
        tags: [type.toLowerCase(), fabric.toLowerCase(), 'salwar-suit', 'women'],
      });
    }
  }

  // --- Kurtis (30) ---
  const kurtiStyles = ['Straight Cut', 'A-Line', 'Anarkali', 'Shirt Style', 'Kaftan', 'Asymmetric'];
  const kurtiFabrics = ['Cotton', 'Rayon', 'Silk', 'Georgette', 'Chanderi'];
  for (const style of kurtiStyles) {
    for (const fabric of kurtiFabrics) {
      const name = `${style} ${fabric} Kurti`;
      const price = randBetween(599, 2999);
      products.push({
        name,
        description: `Stylish ${style.toLowerCase()} kurti in premium ${fabric.toLowerCase()}. Modern design with traditional charm. Perfect for office, casual and festive wear.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'kurtis',
        brand: pick(womensBrands),
        image: pick(IMG.kurti),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: pick([['White', 'Peach', 'Sky Blue'], ['Mustard', 'Olive', 'Maroon'], ['Red', 'Navy', 'Emerald']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [style.toLowerCase(), fabric.toLowerCase(), 'kurti', 'women'],
      });
    }
  }

  // --- Dupattas (15) ---
  const dupattaTypes = ['Bandhani', 'Phulkari', 'Chiffon', 'Banarasi', 'Chanderi'];
  const dupattaStyles = ['Silk', 'Cotton', 'Net'];
  for (const type of dupattaTypes) {
    for (const fabric of dupattaStyles) {
      const name = `${type} ${fabric} Dupatta`;
      const price = randBetween(499, 2499);
      products.push({
        name,
        description: `Beautiful ${type.toLowerCase()} dupatta in ${fabric.toLowerCase()}. Vibrant colours with traditional work. Perfect complement to any ethnic outfit.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'dupattas',
        brand: pick(womensBrands),
        image: pick(IMG.dupatta),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['Free Size'],
        colors: pick([['Red & Yellow', 'Green & Orange', 'Pink & Purple'], ['Gold & Maroon', 'Cream & Red']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [type.toLowerCase(), fabric.toLowerCase(), 'dupatta', 'women'],
      });
    }
  }

  // --- Blouses (15) ---
  const blouseTypes = ['Readymade Embroidered', 'Designer Zardozi', 'Padded Sequin', 'Mirror Work', 'Silk Brocade'];
  const blouseStyles = ['Round Neck', 'Boat Neck', 'Deep Back'];
  for (const type of blouseTypes) {
    for (const style of blouseStyles) {
      const name = `${type} ${style} Blouse`;
      const price = randBetween(599, 2999);
      products.push({
        name,
        description: `${type} blouse with ${style.toLowerCase()} design. Perfectly pairs with silk and designer sarees. Premium finish with padding.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'blouses',
        brand: pick(womensBrands),
        image: pick(IMG.blouse),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['32', '34', '36', '38', '40'],
        colors: pick([['Gold', 'Red', 'Green', 'Black'], ['Maroon', 'Navy', 'Silver']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [type.toLowerCase().split(' ')[0], style.toLowerCase(), 'blouse', 'women'],
      });
    }
  }

  // --- Jewellery (20) ---
  const jewelleryTypes = ['Temple', 'Kundan', 'Polki', 'Meenakari', 'Oxidised Silver'];
  const jewelleryItems = ['Necklace Set', 'Choker Set', 'Jhumka Earrings', 'Bangles Set'];
  for (const type of jewelleryTypes) {
    for (const item of jewelleryItems) {
      const name = `${type} ${item}`;
      const price = randBetween(499, 5999);
      products.push({
        name,
        description: `Exquisite ${type.toLowerCase()} ${item.toLowerCase()}. Gold-plated with traditional craftsmanship. Perfect for weddings, puja and festive occasions.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'jewellery',
        brand: pick(['Tanishq Style', 'Silver Street', 'Kalyan Jewellers', 'Joyalukkas']),
        image: pick(IMG.jewellery),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: [],
        colors: pick([['Gold & Ruby', 'Gold & Emerald'], ['Gold & Pearl', 'Antique Gold'], ['Oxidised Silver']]),
        inStock: true, featured: Math.random() > 0.85,
        tags: [type.toLowerCase(), item.toLowerCase().split(' ')[0], 'jewellery', 'women'],
      });
    }
  }

  // --- Women's Footwear (15) ---
  const wFootwearTypes = ['Embroidered Juttis', 'Kolhapuri Chappals', 'Block Heel Sandals', 'Wedge Sandals', 'Mojari Flats'];
  const wFootwearMaterials = ['Leather', 'Vegan Leather', 'Fabric'];
  for (const type of wFootwearTypes) {
    for (const material of wFootwearMaterials) {
      const name = `Women's ${material} ${type}`;
      const price = randBetween(599, 2999);
      products.push({
        name,
        description: `Handcrafted ${material.toLowerCase()} ${type.toLowerCase()}. Cushioned sole for all-day comfort. Pairs beautifully with ethnic outfits.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'footwear',
        brand: pick(['Rajwada Fashion', 'Metro', 'Bata', 'Catwalk']),
        image: pick(IMG.footwear),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['4', '5', '6', '7', '8', '9'],
        colors: pick([['Multi', 'Red & Gold', 'Pink & Green'], ['Gold', 'Silver', 'Black']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: [type.toLowerCase().split(' ')[0], material.toLowerCase(), 'footwear', 'women'],
      });
    }
  }

  // --- Women's Accessories (10) ---
  const wAccessTypes = ['Payal Anklets', 'Kamarband Belt', 'Maang Tikka', 'Hair Accessory Set', 'Clutch Bag'];
  const wAccessStyles = ['Traditional Gold', 'Silver Oxidised'];
  for (const type of wAccessTypes) {
    for (const style of wAccessStyles) {
      const name = `${style} ${type}`;
      const price = randBetween(299, 1999);
      products.push({
        name,
        description: `${style} ${type.toLowerCase()}. Adds the perfect finishing touch to your ethnic ensemble. Premium quality craftsmanship.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'women',
        subcategory: 'accessories',
        brand: pick(womensBrands),
        image: pick(IMG.accessories),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: [],
        colors: pick([['Gold', 'Silver'], ['Antique Gold', 'Rose Gold']]),
        inStock: true, featured: Math.random() > 0.92,
        tags: [type.toLowerCase().split(' ')[0], style.toLowerCase().split(' ')[0], 'accessories', 'women'],
      });
    }
  }

  return products;
}

// ===============================================================
//  KIDS COLLECTION - ~59 items
// ===============================================================
function generateKidsCollection() {
  const products = [];
  const kidsBrands = ['Little Manyavar', 'Chhota Bheem', 'Fabindia', 'Max Kids', 'Firstcry Exclusive'];

  // --- Kids Ethnic (20) ---
  const kidsEthnicTypes = ['Boys Dhoti Kurta Set', 'Girls Lehenga Choli', 'Boys Sherwani Set', 'Girls Pattu Pavadai'];
  const kidsEthnicFabrics = ['Silk', 'Cotton Silk', 'Art Silk', 'Brocade', 'Chanderi'];
  for (const type of kidsEthnicTypes) {
    for (const fabric of kidsEthnicFabrics) {
      const name = `${type} in ${fabric}`;
      const price = randBetween(799, 3999);
      products.push({
        name,
        description: `Adorable ${type.toLowerCase()} in premium ${fabric.toLowerCase()}. Perfect for festivals, weddings and ceremonies. Comfortable fit for little ones.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'kids',
        subcategory: 'kids-ethnic',
        brand: pick(kidsBrands),
        image: pick(IMG.kids),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y'],
        colors: pick([['Cream & Gold', 'White & Maroon', 'Blue & Gold'], ['Red', 'Pink', 'Orange & Green']]),
        inStock: true, featured: Math.random() > 0.85,
        tags: name.toLowerCase().split(' ').filter(w => w.length > 2).concat(['kids', 'ethnic']),
      });
    }
  }

  // --- Kids Casual (15) ---
  const kidsCasualTypes = ['Boys T-Shirt & Shorts Set', 'Boys Casual Kurta Pajama', 'Girls Tunic & Legging Set'];
  const kidsCasualFabrics = ['Cotton', 'Jersey', 'Cotton Blend', 'Organic Cotton', 'Bamboo Blend'];
  for (const type of kidsCasualTypes) {
    for (const fabric of kidsCasualFabrics) {
      const name = `${type} in ${fabric}`;
      const price = randBetween(399, 1499);
      products.push({
        name,
        description: `Comfortable ${type.toLowerCase()} in soft ${fabric.toLowerCase()}. Easy to wash and maintain. Perfect for playtime and daily wear.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'kids',
        subcategory: 'kids-casual',
        brand: pick(kidsBrands),
        image: pick(IMG.kids),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'],
        colors: pick([['Blue', 'Red', 'Green'], ['Pink', 'Purple', 'Yellow']]),
        inStock: true, featured: Math.random() > 0.9,
        tags: name.toLowerCase().split(' ').filter(w => w.length > 2).concat(['kids', 'casual']),
      });
    }
  }

  // --- Kids Frocks (12) ---
  const frockTypes = ['Party Wear', 'Cotton Printed', 'Tutu Net', 'A-Line Floral'];
  const frockStyles = ['with Bow', 'with Frill', 'with Lace'];
  for (const type of frockTypes) {
    for (const style of frockStyles) {
      const name = `${type} Frock ${style}`;
      const price = randBetween(399, 1999);
      products.push({
        name,
        description: `Adorable ${type.toLowerCase()} frock ${style.toLowerCase()} for little girls. Beautiful design with comfortable fit. Birthday and party special.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'kids',
        subcategory: 'kids-frocks',
        brand: pick(kidsBrands),
        image: pick(IMG.kids),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y'],
        colors: pick([['Pink', 'Red', 'White'], ['Yellow', 'Blue', 'Peach']]),
        inStock: true, featured: Math.random() > 0.88,
        tags: name.toLowerCase().split(' ').filter(w => w.length > 2).concat(['kids', 'frock']),
      });
    }
  }

  // --- Kids Sets (12) ---
  const kidsSetTypes = ['Baby Romper Gift Set', 'Nehru Jacket Set', 'Dungaree Set', 'Ethnic Combo Set'];
  const kidsSetFabrics = ['Organic Cotton', 'Cotton Blend', 'Silk Blend'];
  for (const type of kidsSetTypes) {
    for (const fabric of kidsSetFabrics) {
      const name = `${type} in ${fabric}`;
      const price = randBetween(599, 2499);
      products.push({
        name,
        description: `Lovely ${type.toLowerCase()} in ${fabric.toLowerCase()}. Makes a wonderful gift or everyday wear. Premium quality for your little ones.`,
        price,
        originalPrice: maybeOrigPrice(price),
        category: 'kids',
        subcategory: 'kids-sets',
        brand: pick(kidsBrands),
        image: pick(IMG.kids),
        rating: randRating(),
        reviewCount: randReviews(),
        sizes: type.includes('Baby') ? ['0-6M', '6-12M', '12-18M'] : ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'],
        colors: pick([['Yellow', 'Pink', 'Blue'], ['Saffron & White', 'Blue & White', 'Green & White']]),
        inStock: true, featured: Math.random() > 0.88,
        tags: name.toLowerCase().split(' ').filter(w => w.length > 2).concat(['kids', 'set']),
      });
    }
  }

  return products;
}

// ===============================================================
//  MAIN SEED FUNCTION
// ===============================================================
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[OK] Connected to MongoDB');

    console.log('\n[...] Generating products...');
    const sarees = generateSarees();
    const mensCollection = generateMensCollection();
    const womensOther = generateWomensOther();
    const kidsCollection = generateKidsCollection();

    const allProducts = [
      ...sarees,
      ...mensCollection,
      ...womensOther,
      ...kidsCollection,
    ];

    // -- Deduplication: ensure no name repeats > 10 times --
    const nameCount = {};
    const uniqueProducts = [];
    for (const p of allProducts) {
      const key = p.name.toLowerCase().trim();
      nameCount[key] = (nameCount[key] || 0) + 1;
      if (nameCount[key] <= 10) {
        uniqueProducts.push(p);
      }
    }

    console.log('   Generated: ' + allProducts.length);
    console.log('   After dedup (max 10 per name): ' + uniqueProducts.length);

    // -- Clear existing products --
    await Product.deleteMany({});
    console.log('[OK] Cleared existing products');

    // -- Batch insert (100 at a time) --
    let inserted = 0;
    for (let i = 0; i < uniqueProducts.length; i += 100) {
      const batch = uniqueProducts.slice(i, i + 100);
      await Product.insertMany(batch);
      inserted += batch.length;
      console.log('   Inserted ' + inserted + ' / ' + uniqueProducts.length);
    }

    // -- Summary stats --
    const menCount = uniqueProducts.filter((p) => p.category === 'men').length;
    const womenCount = uniqueProducts.filter((p) => p.category === 'women').length;
    const kidsCount = uniqueProducts.filter((p) => p.category === 'kids').length;

    const subcats = {};
    uniqueProducts.forEach((p) => {
      subcats[p.subcategory] = (subcats[p.subcategory] || 0) + 1;
    });

    console.log('\n=======================================');
    console.log('[OK] SEEDED ' + inserted + ' PRODUCTS');
    console.log('=======================================');
    console.log("   Women's: " + womenCount);
    console.log("   Men's:   " + menCount);
    console.log("   Kids:    " + kidsCount);
    console.log('\n   By subcategory:');
    Object.entries(subcats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sub, count]) => console.log('     ' + sub + ': ' + count));

    await mongoose.disconnect();
    console.log('\n[OK] Done! Database disconnected.');
  } catch (error) {
    console.error('[ERROR] Seed error:', error);
    process.exit(1);
  }
}

seed();
