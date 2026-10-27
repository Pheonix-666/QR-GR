// Initial seed templates for immediate out-of-the-box readiness
// Covers Hotels, Lodges, Restaurants, Gift Shops, and Cafes
// Designed to be genuine, natural, polite, and fully editable by the customer

const seedTemplates = [
  // --- HOTELS ---
  {
    category: 'hotels',
    text: 'Had a wonderful stay here! The front desk staff was exceptionally welcoming at check-in, and our room was spotless, quiet, and comfortable. Highly recommend to anyone visiting the area.',
    sentiment: 'positive',
    tags: 'service, comfort, room'
  },
  {
    category: 'hotels',
    text: 'Great experience from start to finish. The bed was super comfortable, air conditioning worked perfectly, and housekeeping did a fantastic job every day. Will definitely return next trip.',
    sentiment: 'positive',
    tags: 'housekeeping, bed, clean'
  },
  {
    category: 'hotels',
    text: 'Super convenient location and excellent amenities! The staff went out of their way to accommodate our early arrival. Breakfast in the morning was fresh and had plenty of options.',
    sentiment: 'positive',
    tags: 'breakfast, location, staff'
  },
  {
    category: 'hotels',
    text: 'Clean, modern, and very well maintained. Fast Wi-Fi and plenty of desk space made it easy to work remotely during my stay. The shower pressure was also top-notch.',
    sentiment: 'positive',
    tags: 'wifi, modern, business'
  },
  {
    category: 'hotels',
    text: 'Lovely stay with the family. The kids loved the pool, and we appreciated how safe and peaceful the property felt. Friendly team at the concierge desk too!',
    sentiment: 'positive',
    tags: 'family, pool, concierge'
  },
  {
    category: 'hotels',
    text: 'Exceptional hospitality! We arrived late in the evening and the night manager was so accommodating and kind. The room smelled fresh and the linens were crisp and cozy.',
    sentiment: 'positive',
    tags: 'hospitality, late-arrival, clean'
  },
  {
    category: 'hotels',
    text: 'Solid 5-star experience for value and service. Quick check-out process, secure parking, and beautifully appointed rooms. Thank you for making our weekend getaway so pleasant!',
    sentiment: 'positive',
    tags: 'parking, value, weekend'
  },
  {
    category: 'hotels',
    text: 'Quiet, restful sleep in a prime location within walking distance of local attractions. The concierge offered great dinner recommendations. Truly appreciated the attention to detail.',
    sentiment: 'positive',
    tags: 'quiet, walking-distance, recommendations'
  },

  // --- LODGES ---
  {
    category: 'lodges',
    text: 'Such a peaceful and scenic retreat! The lodge has so much rustic charm while providing all the modern comforts you need. Sitting by the fire in the evening was the highlight of our trip.',
    sentiment: 'positive',
    tags: 'rustic, scenic, cozy'
  },
  {
    category: 'lodges',
    text: 'Breathtaking views and genuine mountain hospitality. The wooden interior, plush bedding, and crisp fresh air made this the perfect escape from the city. Can’t wait to come back!',
    sentiment: 'positive',
    tags: 'views, nature, escape'
  },
  {
    category: 'lodges',
    text: 'Cozy cabins, clean bathrooms, and very responsive hosts. Everything was prepared before our arrival, and the surrounding trails were magnificent. A hidden gem!',
    sentiment: 'positive',
    tags: 'cabin, trails, hosts'
  },
  {
    category: 'lodges',
    text: 'We spent the weekend here for a family reunion and could not be happier. Spacious common areas, well-equipped kitchenettes, and warm hospitality throughout our stay.',
    sentiment: 'positive',
    tags: 'reunion, spacious, hospitality'
  },
  {
    category: 'lodges',
    text: 'The best lodge experience we’ve had in years. The morning sunrise from our porch was unforgettable, and the quiet surroundings let us completely unplug and recharge.',
    sentiment: 'positive',
    tags: 'sunrise, peaceful, recharge'
  },
  {
    category: 'lodges',
    text: 'Wonderful ambience, warm fireplace, and super attentive caretakers. They provided firewood and helpful tips for local hikes. Felt like home away from home.',
    sentiment: 'positive',
    tags: 'fireplace, hiking, care'
  },

  // --- RESTAURANTS ---
  {
    category: 'restaurants',
    text: 'Incredible food and outstanding service! Every dish came out hot, beautifully plated, and bursting with flavor. Our server was attentive without being intrusive. Will definitely be back!',
    sentiment: 'positive',
    tags: 'flavor, presentation, server'
  },
  {
    category: 'restaurants',
    text: 'Delicious meal from appetizers to dessert. The flavors were authentic, portions were generous, and the atmosphere was vibrant yet cozy. Make sure to try the chef’s specials!',
    sentiment: 'positive',
    tags: 'authentic, portions, specials'
  },
  {
    category: 'restaurants',
    text: 'Had dinner here with friends and everyone raved about their orders. Fast service despite a busy Friday night, and the cocktail menu was inventive and well balanced.',
    sentiment: 'positive',
    tags: 'cocktails, friends, fast-service'
  },
  {
    category: 'restaurants',
    text: 'Fantastic dining experience! Fresh ingredients and genuine passion in every bite. The manager checked on our table to ensure everything was perfect. Top tier hospitality!',
    sentiment: 'positive',
    tags: 'fresh, manager, quality'
  },
  {
    category: 'restaurants',
    text: 'Great food, fair prices, and clean dining area. The staff was super patient with our dietary requests and offered great suggestions. Highly recommended!',
    sentiment: 'positive',
    tags: 'dietary, value, friendly'
  },
  {
    category: 'restaurants',
    text: 'The flavors here are on another level! Perfectly seasoned, quick turnaround from the kitchen, and a lovely ambient music playlist. One of our new favorite spots.',
    sentiment: 'positive',
    tags: 'seasoning, atmosphere, music'
  },
  {
    category: 'restaurants',
    text: 'Wonderful lunch spot! Crisp salads, savory entrees, and delicious house-made bread. Prompt and polite service. A five-star dining experience all around.',
    sentiment: 'positive',
    tags: 'lunch, homemade, polite'
  },

  // --- GIFT SHOPS ---
  {
    category: 'gift shops',
    text: 'What a charming shop! Packed with unique, handcrafted treasures and thoughtful gifts you won’t find anywhere else. The store owner was so warm and helpful with gift wrapping.',
    sentiment: 'positive',
    tags: 'unique, handcrafted, wrapping'
  },
  {
    category: 'gift shops',
    text: 'Found the perfect souvenirs and birthday presents here. Beautifully curated merchandise, fair prices, and a lovely welcoming atmosphere. A must-visit store!',
    sentiment: 'positive',
    tags: 'souvenirs, curated, fair-prices'
  },
  {
    category: 'gift shops',
    text: 'Delightful shopping experience! Clean, well-organized displays, and the staff is genuinely passionate about the local artisans they support. Walked out with multiple great finds.',
    sentiment: 'positive',
    tags: 'local-artisans, displays, helpful'
  },
  {
    category: 'gift shops',
    text: 'Cutest gift boutique around! Whether you need greeting cards, specialty candles, or one-of-a-kind home accents, they have it all. Excellent customer care.',
    sentiment: 'positive',
    tags: 'boutique, candles, greeting-cards'
  },
  {
    category: 'gift shops',
    text: 'Such a fun place to browse! The staff greeted us with a smile and gave great suggestions for gifts to take back home to family. Highly recommend stopping by!',
    sentiment: 'positive',
    tags: 'browse, friendly, gifts'
  },

  // --- CAFES & COFFEE SHOPS ---
  {
    category: 'cafes',
    text: 'Best espresso in town! The coffee was rich and smooth, and the pastries were freshly baked and buttery. Cozy seating area with great natural light.',
    sentiment: 'positive',
    tags: 'espresso, pastries, seating'
  },
  {
    category: 'cafes',
    text: 'Such a lovely neighborhood cafe. The baristas are super friendly, remember regulars, and brew every cup with care. Great spot to read or catch up with a friend.',
    sentiment: 'positive',
    tags: 'baristas, coffee, community'
  },
  {
    category: 'cafes',
    text: 'Fast service, great matcha latte, and delicious avocado toast. Very clean shop with pleasant background music and strong Wi-Fi. 10/10!',
    sentiment: 'positive',
    tags: 'matcha, breakfast, wifi'
  },

  // --- SALONS & SPAS ---
  {
    category: 'salons',
    text: 'Incredible experience from start to finish! The stylist took the time to understand exactly what I wanted and executed it flawlessly. So relaxing and clean.',
    sentiment: 'positive',
    tags: 'stylist, hair, relax'
  },
  {
    category: 'salons',
    text: 'Hands down the best salon in the area! Super talented team, welcoming atmosphere, and top quality products. Left feeling refreshed and confident.',
    sentiment: 'positive',
    tags: 'talent, atmosphere, quality'
  },
  {
    category: 'salons',
    text: 'Wonderful massage and facial treatment! Calm ambience, attentive staff, and luxurious service. Will definitely be a regular customer here.',
    sentiment: 'positive',
    tags: 'facial, massage, spa'
  },

  // --- CLINICS & HEALTHCARE ---
  {
    category: 'healthcare',
    text: 'Extremely professional and caring staff. The doctor was patient, explained everything clearly, and made me feel completely comfortable. Minimal wait time too!',
    sentiment: 'positive',
    tags: 'doctor, caring, professional'
  },
  {
    category: 'healthcare',
    text: 'Clean, modern clinic with a very compassionate team. From the front desk to the practitioners, everyone was kind and helpful. Highly recommend!',
    sentiment: 'positive',
    tags: 'compassionate, clean, modern'
  },

  // --- RETAIL STORES ---
  {
    category: 'retail',
    text: 'Fantastic selection and very well organized store! The associates were knowledgeable and helped me find exactly what I needed in minutes. Great prices too.',
    sentiment: 'positive',
    tags: 'selection, organized, helpful'
  },
  {
    category: 'retail',
    text: 'Great customer service and high quality products. Checkout was quick and easy. One of my favorite places to shop!',
    sentiment: 'positive',
    tags: 'service, quality, checkout'
  },

  // --- PROFESSIONAL SERVICES & REPAIRS ---
  {
    category: 'services',
    text: 'Outstanding service! Honest, dependable, and did thorough work on time and within budget. Kept me updated throughout the process. 5 stars all the way!',
    sentiment: 'positive',
    tags: 'honest, dependable, thorough'
  },
  {
    category: 'services',
    text: 'Prompt response and excellent communication. They diagnosed the issue immediately and resolved it with great skill. Highly trustworthy professionals.',
    sentiment: 'positive',
    tags: 'prompt, communication, trustworthy'
  }
];

const seedCategories = [
  { name: 'hotels', display_name: 'Hotels & Resorts', icon: 'hotel' },
  { name: 'lodges', display_name: 'Lodges & Cabins', icon: 'mountain' },
  { name: 'restaurants', display_name: 'Restaurants & Dining', icon: 'utensils' },
  { name: 'cafes', display_name: 'Cafes & Bakeries', icon: 'coffee' },
  { name: 'gift shops', display_name: 'Gift Shops & Boutiques', icon: 'gift' },
  { name: 'salons', display_name: 'Salons & Spas', icon: 'scissors' },
  { name: 'healthcare', display_name: 'Clinics & Healthcare', icon: 'heart-pulse' },
  { name: 'retail', display_name: 'Retail Stores', icon: 'shopping-bag' },
  { name: 'services', display_name: 'Professional Services', icon: 'briefcase' }
];

function seedDatabase(dbHelpers) {
  // Insert/upsert seed categories
  for (const cat of seedCategories) {
    dbHelpers.upsertCategory(cat.name, cat.display_name, cat.icon);
  }

  // Import seed review templates if they don't already exist
  const result = dbHelpers.bulkImportTemplates(seedTemplates);
  if (result.imported > 0) {
    console.log(`Initial seed: ${result.imported} templates added.`);
  }

  // Create demo businesses if none exist
  const existingBizCount = dbHelpers.db.prepare('SELECT COUNT(*) as count FROM businesses').get().count;
  if (existingBizCount === 0) {
    console.log('Creating initial demo businesses...');
    dbHelpers.createBusiness({
      id: 'grand-summit-hotel',
      name: 'Grand Summit Luxury Hotel',
      category: 'hotels',
      review_link: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      link_type: 'google_review',
      brand_color: '#1a73e8',
      frame_style: 'branded-card',
      call_to_action: 'We value your experience! Scan to share your Google review.',
      notes: 'Front desk and lobby counter QR standees'
    });

    dbHelpers.createBusiness({
      id: 'pinecrest-mountain-lodge',
      name: 'Pinecrest Mountain Lodge',
      category: 'lodges',
      review_link: 'https://search.google.com/local/writereview?placeid=ChIJ2eUgeAK6j4ARdrFRwip30QU',
      link_type: 'google_review',
      brand_color: '#2e7d32',
      frame_style: 'standee-badge',
      call_to_action: 'Loved your mountain stay? Scan to leave a quick Google review!',
      notes: 'Cabin welcome table QR cards'
    });

    dbHelpers.createBusiness({
      id: 'bella-vista-bistro',
      name: 'Bella Vista Italian Bistro',
      category: 'restaurants',
      review_link: 'https://search.google.com/local/writereview?placeid=ChIJ34f_rDeuEmsRUsoyG83frY7',
      link_type: 'google_review',
      brand_color: '#ea4335',
      frame_style: 'branded-card',
      call_to_action: 'Enjoyed your meal? Scan to share your thoughts on Google!',
      notes: 'Table tent cards placed at dining tables'
    });

    dbHelpers.createBusiness({
      id: 'heritage-gift-shoppe',
      name: 'Heritage Artisan Gift Shop',
      category: 'gift shops',
      review_link: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_FORM/viewform',
      link_type: 'google_form',
      form_entry_id: 'entry.1849204123',
      brand_color: '#9c27b0',
      frame_style: 'modern-dark',
      call_to_action: 'Scan to leave your quick feedback in our prefilled form!',
      notes: 'Checkout counter display card'
    });

    // Create default saved QR codes
    dbHelpers.saveQrCode({
      id: 'qr-grand-frontdesk',
      business_id: 'grand-summit-hotel',
      title: 'Front Desk Counter Standee',
      assigned_template_id: null // Dynamic Randomizer mode
    });

    dbHelpers.saveQrCode({
      id: 'qr-pinecrest-cabin',
      business_id: 'pinecrest-mountain-lodge',
      title: 'Cabin Nightstand QR Card',
      assigned_template_id: null
    });

    dbHelpers.saveQrCode({
      id: 'qr-bistro-table4',
      business_id: 'bella-vista-bistro',
      title: 'Table 4 Tent Card',
      assigned_template_id: null
    });

    dbHelpers.saveQrCode({
      id: 'qr-heritage-register',
      business_id: 'heritage-gift-shoppe',
      title: 'Cash Register Card (Google Form)',
      assigned_template_id: null
    });
  }
}

module.exports = { seedTemplates, seedCategories, seedDatabase };
