export type Language = 'en' | 'bn';

export interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const translations: Translations = {
  // Brand & General
  'brand.name': {
    en: 'Trust Computer-Moulvibazar',
    bn: 'Trust Computer-Moulvibazar',
  },
  'brand.tagline': {
    en: 'Your Trusted Destination for Quality Computers & CCTV Surveillance Systems in Moulvibazar.',
    bn: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
  },
  'brand.address': {
    en: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh.',
    bn: 'টি.এস প্লাজা (২য় তলা), কুসুমবাগ, মৌলভীবাজার, বাংলাদেশ।',
  },
  'brand.hotline': {
    en: '01753-765372',
    bn: '01753-765372',
  },
  'brand.hours': {
    en: 'Sat - Thu: 10:00 AM - 9:00 PM (Friday Closed)',
    bn: 'শনিবার - বৃহস্পতিবার: সকাল ১০:০০ টা - রাত ৯:০০ টা (শুক্রবার বন্ধ)',
  },

  // Header & Nav
  'nav.search_placeholder': {
    en: 'Search CCTV, PC, Laptop, Router, Components...',
    bn: 'সিসিটিভি, পিসি, ল্যাপটপ, রাউটার বা পার্টস খুঁজুন...',
  },
  'nav.compare': {
    en: 'Compare',
    bn: 'তুলনা',
  },
  'nav.wishlist': {
    en: 'Wishlist',
    bn: 'উইশলিস্ট',
  },
  'nav.offers': {
    en: 'Offers',
    bn: 'অফার',
  },
  'nav.special_deals': {
    en: 'Special Deals',
    bn: 'বিশেষ ছাড়',
  },
  'nav.account': {
    en: 'Account',
    bn: 'অ্যাকাউন্ট',
  },
  'nav.register_login': {
    en: 'Register / Login',
    bn: 'লগইন / রেজিস্টার',
  },
  'nav.desktop_pcs': {
    en: 'Desktop PCs',
    bn: 'ডেস্কটপ পিসি',
  },
  'nav.all_products': {
    en: 'All Products',
    bn: 'সব পণ্য',
  },
  'nav.track_order': {
    en: 'Track Order',
    bn: 'অর্ডার ট্র্যাক করুন',
  },
  'nav.cart': {
    en: 'Cart',
    bn: 'ব্যাগ',
  },
  'nav.home': {
    en: 'Home',
    bn: 'হোম',
  },
  'nav.categories': {
    en: 'Categories',
    bn: 'ক্যাটাগরি',
  },
  'nav.products': {
    en: 'Products',
    bn: 'পণ্যসমূহ',
  },
  'nav.language': {
    en: 'Language',
    bn: 'ভাষা',
  },

  // Categories
  'cat.desktop': { en: 'Desktop', bn: 'ডেস্কটপ' },
  'cat.laptop': { en: 'Laptop', bn: 'ল্যাপটপ' },
  'cat.component': { en: 'Component', bn: 'কম্পোনেন্ট' },
  'cat.monitor': { en: 'Monitor', bn: 'মনিটর' },
  'cat.power_ups': { en: 'Power / UPS', bn: 'পাওয়ার ও ইউপিএস' },
  'cat.office_equipment': { en: 'Printers & Scanners', bn: 'প্রিন্টার ও স্ক্যানার' },
  'cat.security': { en: 'CCTV & Security', bn: 'সিসিটিভি ও সিকিউরিটি' },
  'cat.networking': { en: 'Networking', bn: 'নেটওয়ার্কিং' },
  'cat.software': { en: 'Software', bn: 'সফটওয়্যার' },
  'cat.server_storage': { en: 'Server & Storage', bn: 'স্টোরেজ ও এসএসডি' },
  'cat.accessories': { en: 'Accessories', bn: 'এক্সেসরিজ' },
  'cat.gaming': { en: 'Gaming', bn: 'গেমিং' },

  // Product Card & Catalog
  'product.add_to_cart': {
    en: 'Add to Cart',
    bn: 'কার্টে যোগ করুন',
  },
  'product.added': {
    en: 'Added!',
    bn: 'যোগ হয়েছে!',
  },
  'product.out_of_stock': {
    en: 'Out of Stock',
    bn: 'স্টক শেষ',
  },
  'product.in_stock': {
    en: 'In Stock',
    bn: 'স্টকে আছে',
  },
  'product.low_stock': {
    en: 'Only few left!',
    bn: 'সীমিত স্টক!',
  },
  'product.buy_now': {
    en: 'Buy Now',
    bn: 'এখনই কিনুন',
  },
  'product.whatsapp_order': {
    en: 'WhatsApp Order',
    bn: 'হোয়াটসঅ্যাপে অর্ডার',
  },
  'product.warranty': {
    en: 'Warranty',
    bn: 'ওয়ারেন্টি',
  },
  'product.official_warranty': {
    en: 'Official Brand Warranty',
    bn: 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
  },
  'product.view_details': {
    en: 'View Details',
    bn: 'বিস্তারিত দেখুন',
  },
  'product.featured_title': {
    en: 'Featured Products',
    bn: 'জনপ্রিয় পণ্যসমূহ',
  },
  'product.featured_subtitle': {
    en: 'Check & get your desired tech products from Trust Computer Moulvibazar!',
    bn: 'আপনার পছন্দের কম্পিউটার পণ্য ও সিসিটিভি ক্যামেরা বেছে নিন!',
  },
  'product.view_all_catalog': {
    en: 'View All Products in Catalog',
    bn: 'সব পণ্য দেখুন',
  },
  'product.new_arrivals_title': {
    en: 'New Arrivals',
    bn: 'নতুন আগমন',
  },
  'product.new_arrivals_subtitle': {
    en: 'Latest computer components, accessories & CCTV technology in stock',
    bn: 'সর্বশেষ কম্পিউটার পার্টস, এক্সেসরিজ ও প্রযুক্তি সামগ্রী',
  },
  'product.explore_new_arrivals': {
    en: 'Explore All New Arrivals',
    bn: 'সব নতুন পণ্য দেখুন',
  },

  // Cart & Drawer
  'cart.title': {
    en: 'Shopping Bag',
    bn: 'শপিং ব্যাগ',
  },
  'cart.empty_title': {
    en: 'Your Bag is Empty',
    bn: 'আপনার ব্যাগ খালি',
  },
  'cart.empty_desc': {
    en: 'Looks like you have not added anything yet. Explore our catalog!',
    bn: 'আপনার ব্যাগে কোনো পণ্য যোগ করা হয়নি। পছন্দের পণ্য নির্বাচন করুন।',
  },
  'cart.browse_products': {
    en: 'Browse Products',
    bn: 'পণ্য দেখুন',
  },
  'cart.subtotal': {
    en: 'Subtotal',
    bn: 'মোট মূল্য',
  },
  'cart.shipping_note': {
    en: 'Shipping and taxes calculated at checkout.',
    bn: 'ডেলিভারি চার্জ চেকআউট ধাপে হিসাব করা হবে।',
  },
  'cart.proceed_checkout': {
    en: 'Proceed to Checkout',
    bn: 'চেকআউট করুন',
  },
  'cart.order_whatsapp': {
    en: 'Order via WhatsApp Fast',
    bn: 'হোয়াটসঅ্যাপে সরাসরি অর্ডার দিন',
  },
  'cart.clear_all': {
    en: 'Clear Bag',
    bn: 'ব্যাগ খালি করুন',
  },

  // About Page
  'about.title': {
    en: 'About Trust Computer-Moulvibazar',
    bn: 'আমাদের সম্পর্কে - Trust Computer',
  },
  'about.hero_badge': {
    en: 'Your Trusted Destination for Quality Computers & CCTV Surveillance in Moulvibazar.',
    bn: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
  },
  'about.intro_heading': {
    en: 'Who We Are & Our Commitment',
    bn: 'আমাদের পরিচিতি ও অঙ্গীকার',
  },
  'about.intro_p1': {
    en: 'Trust Computer-Moulvibazar is an established and highly reputed technology vendor based in Moulvibazar, Sylhet. We serve customers across Moulvibazar district and adjacent regions with genuine computer hardware, laptops, corporate and residential CCTV surveillance systems, and networking solutions.',
    bn: 'Trust Computer-Moulvibazar মৌলভীবাজার জেলার একটি প্রতিষ্ঠিত এবং নির্ভরযোগ্য প্রযুক্তি সামগ্রী বিক্রেতা প্রতিষ্ঠান। আমরা মৌলভীবাজারবাসী এবং আশপাশের উপজেলার সম্মানিত গ্রাহকদের জন্য গুণগত মানসম্পন্ন কম্পিউটার হার্ডওয়্যার, ল্যাপটপ, হোম ও করপোরেট সিসিটিভি সার্ভেইল্যান্স সিস্টেম, এবং নেটওয়ার্কিং ইকুইপমেন্ট সরবরাহ করে আসছি।',
  },
  'about.intro_p2': {
    en: 'Our primary goal is delivering guaranteed authentic products backed by official manufacturer warranties, prompt after-sales technical support, and building long-lasting trust with every individual and corporate client.',
    bn: 'আমরা গ্রাহকের সন্তুষ্টি ও দীর্ঘমেয়াদী আস্থা রক্ষায় বিশ্বাসী। প্রতিটি পণ্যের ক্ষেত্রে জেনুইন ব্র্যান্ড ও অফিসিয়াল ওয়ারেন্টি সুবিধা নিশ্চিত করাই আমাদের মূল লক্ষ্য।',
  },
  'about.pillar1_title': {
    en: '100% Genuine Products',
    bn: 'আসল পণ্য (100% Genuine)',
  },
  'about.pillar1_desc': {
    en: 'Authentic tech hardware from top global brands including Hikvision, Dahua, TP-Link, Intel, Asus, and HP.',
    bn: 'বিশ্বসেরা ব্র্যান্ড যেমন Hikvision, Dahua, TP-Link, Intel, Asus এর আসল সরঞ্জামাদি।',
  },
  'about.pillar2_title': {
    en: 'CCTV Security Solutions',
    bn: 'সিসি ক্যামেরা সলিউশন',
  },
  'about.pillar2_desc': {
    en: 'Precision CCTV camera installation, configuration, and technical maintenance for homes, offices, and industries.',
    bn: 'দোকান, বাসা-বাড়ি, অফিস ও শিল্পপ্রতিষ্ঠানে নিখুঁত সিসিটিভি ক্যামেরা সেটআপ ও টেকনিক্যাল সাপোর্ট।',
  },
  'about.pillar3_title': {
    en: 'Central Showroom Location',
    bn: 'সহজ শোরুম লোকেশন',
  },
  'about.pillar3_desc': {
    en: 'Convenient physical outlet located at T.S Plaza (2nd Floor), Kusumbagh Point in Moulvibazar.',
    bn: 'কুসুমবাগের কেন্দ্রস্থলে অবস্থিত টি.এস প্লাজা (২য় তলা)-এ সরাসরি শোরুম ভিজিট করার সুবিধা।',
  },
  'about.credentials_heading': {
    en: 'Verified Business Credentials',
    bn: 'ব্যবসা সংক্রান্ত তথ্য (Verified Business Credentials)',
  },
  'about.cred_name': { en: 'Enterprise Name:', bn: 'প্রতিষ্ঠানের নাম:' },
  'about.cred_owner': { en: 'Proprietor:', bn: 'স্বত্বাধিকারী:' },
  'about.cred_address': { en: 'Showroom Address:', bn: 'ঠিকানা:' },
  'about.cred_phone': { en: 'Hotline / Phone:', bn: 'যোগাযোগ ফোন:' },
  'about.cred_email': { en: 'Official Email:', bn: 'অফিসিয়াল ইমেইল:' },
  'about.cred_web': { en: 'Official Website:', bn: 'ওয়েবসাইট:' },
  'about.contact_btn': {
    en: 'Get in Touch / Showroom Map',
    bn: 'যোগাযোগ ও লোকেশন ম্যাপ',
  },
  'about.whatsapp_btn': {
    en: 'Instant WhatsApp Consultation',
    bn: 'হোয়াটসঅ্যাপে তাৎক্ষণিক বার্তা দিন',
  },

  // Contact Page
  'contact.title': {
    en: 'Contact & Showroom Location',
    bn: 'যোগাযোগ ও শোরুম লোকেশন',
  },
  'contact.subtitle': {
    en: 'Visit our Kusumbagh showroom directly or contact us via phone/WhatsApp for any computer hardware, CCTV camera, or servicing inquiries.',
    bn: 'যেকোনো কম্পিউটার পণ্য, সিসিটিভি ক্যামেরা বা সার্ভিসের জন্য সরাসরি আমাদের কুসুমবাগ শোরুমে আসুন অথবা ফোনে যোগাযোগ করুন।',
  },
  'contact.address_title': {
    en: 'Direct Showroom Contact',
    bn: 'সরাসরি যোগাযোগের ঠিকানা',
  },
  'contact.full_address_label': {
    en: 'Full Showroom Address',
    bn: 'শোরুমের পূর্ণ ঠিকানা',
  },
  'contact.hotline_label': {
    en: 'Hotline / Mobile',
    bn: 'হটলাইন / মোবাইল',
  },
  'contact.whatsapp_label': {
    en: 'WhatsApp Support',
    bn: 'হোয়াটসঅ্যাপ সাপোর্ট',
  },
  'contact.whatsapp_direct': {
    en: '+880 1753-765372 (Direct Chat)',
    bn: '+880 1753-765372 (সরাসরি মেসেজ দিন)',
  },
  'contact.email_label': {
    en: 'Official Email',
    bn: 'ইমেইল',
  },
  'contact.facebook_label': {
    en: 'Facebook Page',
    bn: 'ফেসবুক পেজ',
  },
  'contact.schedule_label': {
    en: 'Showroom Schedule',
    bn: 'শোরুমের সময়সূচি',
  },
  'contact.schedule_timing': {
    en: 'Saturday to Thursday: 10:00 AM - 9:00 PM',
    bn: 'শনিবার থেকে বৃহস্পতিবার: সকাল ১০:০০ টা - রাত ৯:০০ টা',
  },
  'contact.schedule_note': {
    en: '(Showroom closed on Friday, online orders and WhatsApp inquiries remain active)',
    bn: '(শুক্রবার শোরুম বন্ধ, তবে অনলাইনে অর্ডার গ্রহণ চালু থাকে)',
  },
  'contact.form_title': {
    en: 'Send an Inquiry / Message',
    bn: 'বার্তা পাঠান (Send an Inquiry)',
  },
  'contact.form_name': {
    en: 'Your Full Name *',
    bn: 'আপনার নাম *',
  },
  'contact.form_name_ph': {
    en: 'Enter your full name',
    bn: 'আপনার নাম লিখুন',
  },
  'contact.form_phone': {
    en: 'Mobile Number *',
    bn: 'মোবাইল নম্বর *',
  },
  'contact.form_phone_ph': {
    en: '01XXXXXXXXX',
    bn: '01XXXXXXXXX',
  },
  'contact.form_message': {
    en: 'Message or Product Details *',
    bn: 'বার্তা বা পণ্যের বিবরণ *',
  },
  'contact.form_message_ph': {
    en: 'Tell us which product, CCTV setup, or service you are interested in...',
    bn: 'আপনি কোন পণ্য বা সেবা সম্পর্কে জানতে চান লিখুন...',
  },
  'contact.form_send': {
    en: 'Send Inquiry Message',
    bn: 'বার্তা পাঠান',
  },
  'contact.form_success_title': {
    en: 'Message Sent Successfully!',
    bn: 'বার্তা সফলভাবে পাঠানো হয়েছে!',
  },
  'contact.form_success_desc': {
    en: 'Thank you. Our customer support team will contact you shortly.',
    bn: 'ধন্যবাদ। আমাদের কাস্টমার সাপোর্ট প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।',
  },
  'contact.form_send_another': {
    en: 'Send Another Message',
    bn: 'নতুন বার্তা পাঠান',
  },
  'contact.whatsapp_reply_btn': {
    en: 'Get Instant Reply on WhatsApp',
    bn: 'হোয়াটসঅ্যাপে তাৎক্ষণিক উত্তর পান',
  },

  // Home components
  'home.offers_title': {
    en: 'Special Offers & Limited Deals',
    bn: 'বিশেষ অফার ও সীমিত সময়ের ছাড়',
  },
  'home.offers_subtitle': {
    en: 'Exclusive promotions currently running at Trust Computer Moulvibazar',
    bn: 'ট্রাস্ট কম্পিউটার মৌলভীবাজারে চলমান আকর্ষণীয় অফারসমূহ',
  },
  'home.view_all_offers': {
    en: 'View All Offers',
    bn: 'সব অফার দেখুন',
  },
  'home.showroom_heading': {
    en: 'Welcome to Trust Computer-Moulvibazar Showroom',
    bn: 'Trust Computer-Moulvibazar শোরুমে আপনাকে স্বাগতম',
  },
  'home.showroom_badge': {
    en: 'Trusted IT & Security Solutions in Moulvibazar',
    bn: 'মৌলভীবাজারের নির্ভরযোগ্য আইটি ও সিকিউরিটি সলিউশন',
  },
  'home.showroom_desc': {
    en: 'Visit our physical outlet at T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar for genuine CCTV camera setups (Hikvision, Dahua), custom gaming and workstation desktop builds, laptops, networking routers, and peripherals. Our certified technicians provide on-site security camera installation and complete computer servicing.',
    bn: 'জেনুইন সিসিটিভি ক্যামেরা (Hikvision, Dahua), কাস্টম গেমিং ও ফ্রিল্যান্সিং ডেস্কটপ পিসি, ল্যাপটপ, রাউটার ও প্রয়োজনীয় আইটি সামগ্রীর জন্য সরাসরি আমাদের কুসুমবাগ শোরুমে আসুন। দক্ষ টেকনিশিয়ান দ্বারা অন-সাইট সিসিটিভি ইনস্টলেশন ও কম্পিউটার সার্ভিসিং সেবা প্রদান করা হয়।',
  },
  'home.direct_orders_title': {
    en: 'Direct Inquiries & Fast Orders',
    bn: 'সরাসরি যোগাযোগ ও দ্রুত অর্ডার',
  },
  'home.send_whatsapp': {
    en: 'Send WhatsApp Message',
    bn: 'হোয়াটসঅ্যাপে মেসেজ পাঠান',
  },
  'home.call_hotline': {
    en: 'Call Hotline: 01753-765372',
    bn: 'কল করুন: 01753-765372',
  },
  'home.directions': {
    en: 'Showroom Map & Directions',
    bn: 'শোরুম ম্যাপ ও লোকেশন',
  },

  // Footer
  'footer.prop1_title': { en: '100% Genuine Products', bn: '১০০% আসল পণ্য' },
  'footer.prop1_desc': { en: 'Official brand warranty & verified authentic tech components', bn: 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি ও আসল পার্টসের নিশ্চয়তা' },
  'footer.prop2_title': { en: 'Central Moulvibazar Showroom', bn: 'কুসুমবাগে নিজস্ব শোরুম' },
  'footer.prop2_desc': { en: 'T.S Plaza (2nd Floor), Kusumbagh Point', bn: 'টি.এস প্লাজা (২য় তলা), কুসুমবাগ পয়েন্ট' },
  'footer.prop3_title': { en: 'Direct WhatsApp Consultation', bn: 'সরাসরি হোয়াটসঅ্যাপ সহায়তা' },
  'footer.prop3_desc': { en: 'Real-time technical advice & CCTV setup assistance', bn: 'রিয়েল-টাইম টেকনিক্যাল পরামর্শ ও অর্ডার সুবিধা' },
  'footer.prop4_title': { en: 'Fast Nationwide Delivery', bn: 'দ্রুত ডেলিভারি সুবিধা' },
  'footer.prop4_desc': { en: 'Moulvibazar local express & reliable courier delivery', bn: 'মৌলভীবাজার সদরে হোম ডেলিভারি ও সারাদেশে কুরিয়ার' },
  'footer.categories_title': { en: 'Product Categories', bn: 'পণ্য বিভাগ' },
  'footer.support_title': { en: 'Customer Support & Policies', bn: 'কাস্টমার সাপোর্ট ও পলিসি' },
  'footer.contact_title': { en: 'Showroom Contact', bn: 'শোরুমের যোগাযোগ' },
  'footer.all_rights': { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  'footer.dev_partner': { en: 'Software Developed BY Amdads Group', bn: 'সফটওয়্যার ডেভেলপমেন্ট: Amdads Group' },
};
