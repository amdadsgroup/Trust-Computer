const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('------------------------------------------------------------');
  console.log('🌱 Starting Trust Computer-Moulvibazar Real Database Sync...');
  console.log('------------------------------------------------------------');

  // 1. Site Settings
  console.log('1. Upserting Store Settings...');
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Trust Computer-Moulvibazar',
      ownerName: 'Shiblu Ahmed',
      phone: '01753-765372',
      email: 'trustcomputermb@gmail.com',
      address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
      facebookUrl: 'https://www.facebook.com/TrustComputerr/',
      whatsappNumber: '+8801753765372',
      storeDescription: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
      deliveryFeeInsideMoulvibazar: 60.0,
      deliveryFeeOutsideMoulvibazar: 120.0,
      freeDeliveryThreshold: 10000.0,
      isMaintenanceMode: false,
    },
    create: {
      id: 'default',
      storeName: 'Trust Computer-Moulvibazar',
      ownerName: 'Shiblu Ahmed',
      phone: '01753-765372',
      email: 'trustcomputermb@gmail.com',
      address: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh',
      facebookUrl: 'https://www.facebook.com/TrustComputerr/',
      whatsappNumber: '+8801753765372',
      storeDescription: 'মানসম্মত কম্পিউটার ও সিসি ক্যামেরা জগতে মৌলভীবাজারের একটি বিশ্বস্ত প্রতিষ্ঠান।❤️',
      deliveryFeeInsideMoulvibazar: 60.0,
      deliveryFeeOutsideMoulvibazar: 120.0,
      freeDeliveryThreshold: 10000.0,
      isMaintenanceMode: false,
    },
  });
  console.log('✓ Store settings saved:', siteSettings.storeName);

  // 2. Owner Account Creation / Verification
  console.log('2. Syncing Owner Administrator Account...');
  const ownerEmail = process.env.INITIAL_OWNER_EMAIL || 'trustcomputermb@gmail.com';
  const ownerPassword = process.env.INITIAL_OWNER_PASSWORD || 'Trust@Moulvibazar2026!';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ownerPassword, salt);

  const ownerUser = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      role: 'OWNER',
      name: 'Shiblu Ahmed',
      phone: '01753-765372',
      isActive: true,
    },
    create: {
      email: ownerEmail,
      passwordHash,
      name: 'Shiblu Ahmed',
      phone: '01753-765372',
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log(`✓ Owner account verified: ${ownerUser.name} (${ownerUser.email})`);

  // 3. Categories
  console.log('3. Upserting Real Store Categories...');
  const categoriesData = [
    {
      name: 'CCTV & Surveillance',
      slug: 'cctv-surveillance',
      description: 'High definition ColorVu CCTV cameras, DVRs, XVRs, surveillance hard drives & security accessories in Moulvibazar.',
      sortOrder: 1,
    },
    {
      name: 'Desktop & Components',
      slug: 'desktop-components',
      description: 'Processors, Motherboards, RAM, NVMe SSDs, Graphics Cards, Power Supplies and Cases for custom PC builds.',
      sortOrder: 2,
    },
    {
      name: 'Laptops & Notebooks',
      slug: 'laptops-notebooks',
      description: 'Official brand new business, student, and high performance laptops with authorized manufacturer warranties.',
      sortOrder: 3,
    },
    {
      name: 'Networking Equipment',
      slug: 'networking-equipment',
      description: 'Dual-band Wi-Fi Routers, Gigabit Network Switches, Cat6 Cables, Access Points & Fiber connectors.',
      sortOrder: 4,
    },
    {
      name: 'Computer Accessories',
      slug: 'computer-accessories',
      description: 'Ergonomic keyboards, gaming mouse, headphones, soundbars, webcams, and heavy duty computer cables.',
      sortOrder: 5,
    },
    {
      name: 'Printers & Scanners',
      slug: 'printers-scanners',
      description: 'Reliable inkjet, laser, and all-in-one multifunction business printers and barcode scanners.',
      sortOrder: 6,
    },
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder, isActive: true },
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, upserted.id);
  }
  console.log(`✓ ${categoryMap.size} categories synced.`);

  // 4. Verified Brands
  console.log('4. Upserting Authentic Global Brands...');
  const brandsData = [
    { name: 'Hikvision', slug: 'hikvision', description: 'Global leader in smart video surveillance and ColorVu security systems.' },
    { name: 'Dahua', slug: 'dahua', description: 'World-leading video-centric smart IoT solutions and WizSense AI recorders.' },
    { name: 'TP-Link', slug: 'tp-link', description: 'Reliable networking devices, gigabit routers, and smart connectivity.' },
    { name: 'Intel', slug: 'intel', description: 'World standard Core i3, i5, i7 computing processors and silicon solutions.' },
    { name: 'AMD', slug: 'amd', description: 'High performance Ryzen processors and Radeon graphics architectures.' },
    { name: 'Asus', slug: 'asus', description: 'Premium motherboards, Eye Care monitors, and gaming hardware components.' },
    { name: 'Western Digital', slug: 'western-digital', description: 'Industry leading Purple surveillance storage hard drives and WD SSDs.' },
    { name: 'Samsung', slug: 'samsung', description: 'Ultra high-speed NVMe M.2 solid state drives and computing memory.' },
    { name: 'HP', slug: 'hp', description: 'Official high-efficiency commercial and consumer laptops and computing systems.' },
    { name: 'Corsair', slug: 'corsair', description: 'High performance enthusiast Vengeance LPX DDR4/DDR5 system memory.' },
    { name: 'Fantech', slug: 'fantech', description: 'Ergonomic gaming peripherals, mechanical keyboards, and precision mice.' },
    { name: 'A4Tech', slug: 'a4tech', description: 'Durable daily office keyboards, wireless mice, and Fstyler accessories.' },
  ];

  const brandMap = new Map();
  for (const b of brandsData) {
    const upserted = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description, isActive: true },
      create: { ...b, isActive: true },
    });
    brandMap.set(b.slug, upserted.id);
  }
  console.log(`✓ ${brandMap.size} brands synced.`);

  // 5. Authentic Products Catalog
  console.log('5. Upserting Authentic Products & Real Specifications...');
  const productsData = [
    {
      name: 'Hikvision DS-2CE10DF0T-F 2MP ColorVu Bullet CCTV Camera',
      slug: 'hikvision-ds-2ce10df0t-f-2mp-colorvu-bullet-cctv',
      sku: 'HK-DS2CE10DF0TF',
      barcode: '6931847192801',
      description: 'The Hikvision DS-2CE10DF0T-F provides 24/7 vivid color imaging with an F1.0 advanced lens and high-performance sensor. The F1.0 super-aperture collects more light to produce brighter images even in extreme darkness. Ideal for outdoor perimeter security in homes, shops, and offices throughout Moulvibazar.',
      sellingPrice: 2350,
      compareAtPrice: 2600,
      costPrice: 2000,
      stock: 24,
      lowStockThreshold: 5,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '2 Years Official Replacement',
      categorySlug: 'cctv-surveillance',
      brandSlug: 'hikvision',
      imageUrl: '/products/hikvision-colorvu-bullet.svg',
      specs: [
        { group: 'Camera Sensor', key: 'Image Sensor', value: '2 MP CMOS' },
        { group: 'Camera Sensor', key: 'Max Resolution', value: '1920 (H) × 1080 (V) Full HD' },
        { group: 'Night Vision', key: 'ColorVu White Light', value: 'Up to 20 meters 24/7 Color' },
        { group: 'Lens', key: 'Lens Type', value: '2.8 mm Fixed Focal Lens' },
        { group: 'General', key: 'Weather Protection', value: 'IP67 Weatherproof Outdoor Rating' },
        { group: 'Video Output', key: 'Signal System', value: 'TVI/AHD/CVI/CVBS Switchable' },
      ],
    },
    {
      name: 'Hikvision DS-2CE70DF0T-PF 2MP ColorVu Indoor Dome CCTV Camera',
      slug: 'hikvision-ds-2ce70df0t-pf-2mp-colorvu-dome-cctv',
      sku: 'HK-DS2CE70DF0TPF',
      barcode: '6931847192818',
      description: 'Hikvision DS-2CE70DF0T-PF ColorVu indoor dome camera delivers 24/7 full-time color video indoors. Warm supplemental light ensures clear identification of intruders or visitors in complete pitch black conditions. Specially suited for retail showrooms, banks, and residences.',
      sellingPrice: 2200,
      compareAtPrice: 2450,
      costPrice: 1850,
      stock: 20,
      lowStockThreshold: 4,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      warrantyInfo: '2 Years Official Replacement',
      categorySlug: 'cctv-surveillance',
      brandSlug: 'hikvision',
      imageUrl: '/products/hikvision-colorvu-dome.svg',
      specs: [
        { group: 'Camera Sensor', key: 'Image Sensor', value: '2 Megapixel Progressive CMOS' },
        { group: 'Camera Sensor', key: 'Max Resolution', value: '1080P Full HD (1920 × 1080)' },
        { group: 'Night Vision', key: 'Supplemental Lighting', value: 'Warm White Light up to 20m' },
        { group: 'Lens', key: 'Field of View', value: 'Horizontal FOV: 98°, Vertical: 51°' },
        { group: 'General', key: 'Enclosure', value: 'High Quality Indoor Plastic Turret Dome' },
      ],
    },
    {
      name: 'Dahua DH-XVR1B08-I 8-Channel AI WizSense HD 1080P Digital Video Recorder',
      slug: 'dahua-dh-xvr1b08-i-8-channel-wizsense-xvr',
      sku: 'DH-XVR1B08-I',
      barcode: '6971669472019',
      description: 'Dahua DH-XVR1B08-I features WizSense AI technology that dramatically reduces false alarms by focusing on human and vehicle classification with SMD Plus. Supports up to 8 HD analog channels plus 2 additional IP channels up to 6MP, with H.265+ smart compression saving up to 70% storage.',
      sellingPrice: 5800,
      compareAtPrice: 6400,
      costPrice: 5100,
      stock: 12,
      lowStockThreshold: 3,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '2 Years Official Warranty',
      categorySlug: 'cctv-surveillance',
      brandSlug: 'dahua',
      imageUrl: '/products/dahua-8ch-xvr.svg',
      specs: [
        { group: 'Video Channels', key: 'Analog Channels', value: '8 Channels BNC inputs' },
        { group: 'AI Features', key: 'SMD Plus', value: 'Human & Vehicle Motion Filter on 8 Channels' },
        { group: 'Compression', key: 'Video Codec', value: 'H.265+ / H.265 / H.264+ / H.264' },
        { group: 'Storage', key: 'SATA Interface', value: '1 SATA Port, up to 6 TB capacity' },
        { group: 'Display Output', key: 'Outputs', value: '1 HDMI, 1 VGA Simultaneous Output' },
      ],
    },
    {
      name: 'Western Digital Purple 2TB Surveillance Hard Drive (WD20PURZ)',
      slug: 'western-digital-purple-2tb-surveillance-hard-drive',
      sku: 'WD-PURPLE-2TB',
      barcode: '718037856773',
      description: 'Western Digital Purple surveillance hard drives are built specifically for 24/7, always-on, high-definition security systems. Engineered with AllFrame technology to reduce video frame loss, improve overall video playback, and withstand temperature fluctuations inside surveillance DVRs and NVRs.',
      sellingPrice: 7200,
      compareAtPrice: 7800,
      costPrice: 6500,
      stock: 16,
      lowStockThreshold: 4,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '2 Years Official Warranty',
      categorySlug: 'cctv-surveillance',
      brandSlug: 'western-digital',
      imageUrl: '/products/wd-purple-2tb.svg',
      specs: [
        { group: 'Capacity', key: 'Storage Capacity', value: '2.0 TB (Terabytes)' },
        { group: 'Performance', key: 'Interface & Cache', value: 'SATA 6 Gb/s with 64MB Cache' },
        { group: 'Technology', key: 'Firmware', value: 'WD AllFrame 4K Technology' },
        { group: 'Cameras Supported', key: 'Stream Count', value: 'Supports up to 64 HD Cameras' },
        { group: 'Form Factor', key: 'Drive Size', value: '3.5-inch Internal Hard Drive' },
      ],
    },
    {
      name: 'TP-Link Archer C6 AC1200 Gigabit Dual-Band Wi-Fi Router',
      slug: 'tp-link-archer-c6-ac1200-gigabit-router',
      sku: 'TPL-ARCHER-C6',
      barcode: '6935364083588',
      description: 'The Archer C6 creates a reliable and blazing-fast Wi-Fi network powered by 802.11ac Wi-Fi technology. The 2.4GHz band delivers speeds up to 300Mbps for everyday tasks like emailing and web browsing, while the 5GHz band delivers up to 867Mbps for lag-free online gaming and 4K streaming.',
      sellingPrice: 2950,
      compareAtPrice: 3300,
      costPrice: 2600,
      stock: 25,
      lowStockThreshold: 5,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '1 Year Replacement Warranty',
      categorySlug: 'networking-equipment',
      brandSlug: 'tp-link',
      imageUrl: '/products/tplink-archer-c6.svg',
      specs: [
        { group: 'Wireless Speed', key: 'Wi-Fi Speeds', value: '867 Mbps (5 GHz) + 300 Mbps (2.4 GHz)' },
        { group: 'Hardware', key: 'Ethernet Ports', value: '1× Gigabit WAN + 4× Gigabit LAN' },
        { group: 'Antennas', key: 'Antenna Setup', value: '4 High Performance External Antennas' },
        { group: 'Multi-User', key: 'MU-MIMO Support', value: 'Transfers data to multiple devices at once' },
        { group: 'Modes', key: 'Operating Modes', value: 'Router Mode, Access Point (AP) Mode' },
      ],
    },
    {
      name: 'TP-Link TL-SG1008D 8-Port Gigabit Desktop Network Switch',
      slug: 'tp-link-tl-sg1008d-8-port-gigabit-switch',
      sku: 'TPL-SG1008D',
      barcode: '6935364020132',
      description: 'TP-Link TL-SG1008D 8-Port Gigabit Desktop Switch provides an easy way to make the transition to Gigabit Ethernet. Increase the speed of your network server and backbone connections, or make Gigabit to the desktop a reality.',
      sellingPrice: 1850,
      compareAtPrice: 2100,
      costPrice: 1600,
      stock: 18,
      lowStockThreshold: 4,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      warrantyInfo: '1 Year Replacement Warranty',
      categorySlug: 'networking-equipment',
      brandSlug: 'tp-link',
      imageUrl: '/products/tplink-8port-switch.svg',
      specs: [
        { group: 'Ports', key: 'RJ45 Ports', value: '8× 10/100/1000Mbps Auto-Negotiation Ports' },
        { group: 'Energy Efficiency', key: 'Green Technology', value: 'Saves power consumption up to 80%' },
        { group: 'Architecture', key: 'Switching Capacity', value: '16 Gbps non-blocking wire-speed' },
        { group: 'Installation', key: 'Plug and Play', value: 'No configuration required' },
      ],
    },
    {
      name: 'Intel Core i5-12400 12th Gen Alder Lake Processor',
      slug: 'intel-core-i5-12400-12th-gen-processor',
      sku: 'INTEL-I5-12400',
      barcode: '735858503044',
      description: 'Intel Core i5-12400 12th Generation desktop processor features 6 Golden Cove Performance cores and 12 threads with up to 4.40GHz Max Turbo Frequency. Built on Intel 7 process technology with integrated Intel UHD Graphics 730 and PCIe 5.0 support, making it the most balanced gaming and productivity CPU in Bangladesh.',
      sellingPrice: 15800,
      compareAtPrice: 17200,
      costPrice: 14600,
      stock: 10,
      lowStockThreshold: 2,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '3 Years Official Warranty',
      categorySlug: 'desktop-components',
      brandSlug: 'intel',
      imageUrl: '/products/intel-i5-12400.svg',
      specs: [
        { group: 'Processor Specs', key: 'Total Cores / Threads', value: '6 Cores (6 P-Cores) / 12 Threads' },
        { group: 'Frequency', key: 'Clock Speed', value: '2.50 GHz Base / 4.40 GHz Max Turbo' },
        { group: 'Cache', key: 'Intel Smart Cache', value: '18 MB L3 Cache' },
        { group: 'Socket', key: 'Motherboard Socket', value: 'LGA1700 (600 & 700 Series Chipsets)' },
        { group: 'Graphics', key: 'Integrated GPU', value: 'Intel UHD Graphics 730' },
      ],
    },
    {
      name: 'Asus PRIME H610M-K D4 Micro-ATX Motherboard',
      slug: 'asus-prime-h610m-k-d4-motherboard',
      sku: 'ASUS-PRIME-H610MK',
      barcode: '4711081545645',
      description: 'Asus PRIME H610M-K D4 is expertly engineered to unleash the full potential of 12th, 13th, and 14th Gen Intel Core processors. Boasting a robust power design, comprehensive cooling solutions, and intelligent tuning options, the motherboard provides daily users and DIY PC builders a wide range of performance tuning options.',
      sellingPrice: 10500,
      compareAtPrice: 11400,
      costPrice: 9600,
      stock: 14,
      lowStockThreshold: 3,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      warrantyInfo: '3 Years Official Warranty',
      categorySlug: 'desktop-components',
      brandSlug: 'asus',
      imageUrl: '/products/asus-h610m-k.svg',
      specs: [
        { group: 'Chipset', key: 'Platform', value: 'Intel H610 Chipset / LGA1700' },
        { group: 'Memory', key: 'RAM Support', value: '2x DDR4 DIMM slots up to 64GB (3200MHz)' },
        { group: 'Expansion', key: 'PCIe Slots', value: '1x PCIe 4.0 x16 Slot with SafeSlot Core' },
        { group: 'Storage', key: 'M.2 NVMe', value: '1x M.2 PCIe 3.0 x4 (up to 32Gbps) + 4x SATA 6Gb/s' },
        { group: 'Rear I/O', key: 'Display Ports', value: '1x HDMI 2.1, 1x D-Sub (VGA)' },
      ],
    },
    {
      name: 'Corsair Vengeance LPX 16GB DDR4 3200MHz Desktop RAM',
      slug: 'corsair-vengeance-lpx-16gb-ddr4-3200mhz-ram',
      sku: 'CORSAIR-16GB-3200',
      barcode: '843597087823',
      description: 'VENGEANCE LPX memory is designed for high-performance overclocking. The heatspreader is made of pure aluminum for faster heat dissipation, and the eight-layer PCB helps manage heat and provides superior overclocking headroom.',
      sellingPrice: 4200,
      compareAtPrice: 4650,
      costPrice: 3750,
      stock: 22,
      lowStockThreshold: 5,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: 'Lifetime Official Warranty',
      categorySlug: 'desktop-components',
      brandSlug: 'corsair',
      imageUrl: '/products/corsair-16gb-ram.svg',
      specs: [
        { group: 'Memory Specs', key: 'Capacity', value: '16GB (1 x 16GB Module)' },
        { group: 'Performance', key: 'Tested Speed', value: 'DDR4 3200MHz (PC4-25600)' },
        { group: 'Timings', key: 'Tested Latency', value: '16-20-20-38 at 1.35V' },
        { group: 'Overclocking', key: 'Intel XMP', value: 'XMP 2.0 Certified One-Click Profile' },
        { group: 'Heat Spreader', key: 'Design', value: 'Anodized Pure Aluminum Low-Profile' },
      ],
    },
    {
      name: 'Samsung 980 500GB PCIe 3.0 NVMe M.2 Internal SSD',
      slug: 'samsung-980-500gb-nvme-m2-ssd',
      sku: 'SAM-980-500GB',
      barcode: '887276437255',
      description: 'Upgrade to mind-boggling NVMe speed with the Samsung 980. Harnessing virtually all the speed advantages of PCIe 3.0 through HMB technology and dramatic NVMe efficiency, the 980 delivers sequential read speeds up to 3,100 MB/s—over 6.2x the speed of standard SATA SSDs.',
      sellingPrice: 5400,
      compareAtPrice: 5900,
      costPrice: 4800,
      stock: 15,
      lowStockThreshold: 3,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '5 Years Official Warranty',
      categorySlug: 'desktop-components',
      brandSlug: 'samsung',
      imageUrl: '/products/samsung-980-ssd.svg',
      specs: [
        { group: 'Performance', key: 'Sequential Read', value: 'Up to 3,100 MB/s' },
        { group: 'Performance', key: 'Sequential Write', value: 'Up to 2,600 MB/s' },
        { group: 'Interface', key: 'Form Factor', value: 'PCIe Gen 3.0 x4, NVMe 1.4 in M.2 2280' },
        { group: 'Endurance', key: 'TBW Rating', value: '300 TBW (Terabytes Written)' },
        { group: 'Thermal Control', key: 'Protection', value: 'Nickel-Coated Controller & Heat Spreader Label' },
      ],
    },
    {
      name: 'HP 15s-fq5342TU Core i3 12th Gen 15.6" FHD Laptop',
      slug: 'hp-15s-fq5342tu-core-i3-12th-gen-laptop',
      sku: 'HP-15S-FQ5342TU',
      barcode: '197029513824',
      description: 'Stay connected to what matters most with long-lasting battery life and a thin, portable, micro-edge bezel design. Built to keep you productive and entertained from anywhere, the HP 15.6" laptop features Intel Core i3-1215U processor, 8GB DDR4 RAM, and 512GB PCIe NVMe SSD.',
      sellingPrice: 54500,
      compareAtPrice: 57000,
      costPrice: 50500,
      stock: 6,
      lowStockThreshold: 2,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      warrantyInfo: '2 Years Official Warranty',
      categorySlug: 'laptops-notebooks',
      brandSlug: 'hp',
      imageUrl: '/products/hp-15s-laptop.svg',
      specs: [
        { group: 'Processor', key: 'CPU Model', value: 'Intel Core i3-1215U (up to 4.40 GHz, 6 Cores)' },
        { group: 'Memory & Storage', key: 'RAM & SSD', value: '8 GB DDR4-3200 MHz RAM + 512 GB PCIe NVMe M.2 SSD' },
        { group: 'Display', key: 'Screen Size & Panel', value: '15.6" Full HD (1920 x 1080) Micro-edge Anti-glare' },
        { group: 'Battery & Power', key: 'Battery Life', value: '3-cell, 41 Wh Li-ion with HP Fast Charge' },
        { group: 'Operating System', key: 'OS Included', value: 'Genuine Windows 11 Home 64-bit' },
      ],
    },
    {
      name: 'Asus VP228HE 21.5" Full HD Eye Care LED Monitor',
      slug: 'asus-vp228he-21-5-inch-fhd-gaming-monitor',
      sku: 'ASUS-VP228HE',
      barcode: '4712900085815',
      description: 'Asus VP228HE 21.5" Full HD monitor with 100,000,000:1 high contrast ratio, ASUS-exclusive SplendidPlus and VivdPixel technologies is optimized for the finest image and color quality. ASUS Eye Care monitors feature TÜV Rheinland-certified Flicker-free and Low Blue Light technologies to ensure a comfortable viewing experience.',
      sellingPrice: 11900,
      compareAtPrice: 12800,
      costPrice: 10700,
      stock: 9,
      lowStockThreshold: 2,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      warrantyInfo: '3 Years Official Warranty',
      categorySlug: 'desktop-components',
      brandSlug: 'asus',
      imageUrl: '/products/asus-vp228he-monitor.svg',
      specs: [
        { group: 'Display Panel', key: 'Screen Size & Resolution', value: '21.5" Full HD (1920x1080) LED Backlit' },
        { group: 'Response & Refresh', key: 'Speed', value: '1ms (GTG) Quick Response with 75Hz Refresh' },
        { group: 'Eye Care', key: 'Certifications', value: 'TÜV Rheinland Flicker-Free & Blue Light Filter' },
        { group: 'Connectivity', key: 'Input Ports', value: '1x HDMI, 1x D-Sub (VGA), 3.5mm Audio In' },
        { group: 'Audio', key: 'Built-in Speakers', value: '1.5W x 2 Stereo RMS Speakers' },
      ],
    },
    {
      name: 'Fantech MAJOR KX-302 RGB Gaming Keyboard & Mouse Combo',
      slug: 'fantech-major-kx-302-rgb-gaming-combo',
      sku: 'FAN-KX302-COMBO',
      barcode: '8997230154812',
      description: 'Fantech MAJOR KX-302 is an ultra-durable RGB backlit keyboard and high-precision optical gaming mouse combination. Designed with suspended keycaps, 25-key anti-ghosting rollover, braided durable cabling with magnetic ferrite noise suppressor, and on-the-fly 3200 DPI mouse adjustments.',
      sellingPrice: 1750,
      compareAtPrice: 2050,
      costPrice: 1450,
      stock: 28,
      lowStockThreshold: 5,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      warrantyInfo: '1 Year Warranty',
      categorySlug: 'computer-accessories',
      brandSlug: 'fantech',
      imageUrl: '/products/fantech-kx302-combo.svg',
      specs: [
        { group: 'Keyboard Features', key: 'Keys & Anti-Ghosting', value: '104 Keys with 25-Key Anti-Ghosting' },
        { group: 'Lighting', key: 'Backlighting', value: 'Multi-Color RGB Spectrum Backlit' },
        { group: 'Mouse Features', key: 'Sensor Resolution', value: 'Up to 3200 DPI Optical Gaming Sensor' },
        { group: 'Cable Quality', key: 'Cabling', value: '1.8m Braided Nylon Cable with Magnetic Ferrite Ring' },
      ],
    },
    {
      name: 'A4Tech FG10 Fstyler 2.4G Wireless Mouse',
      slug: 'a4tech-fg10-fstyler-wireless-mouse',
      sku: 'A4T-FG10-MOUSE',
      barcode: '4711421941655',
      description: 'A4Tech Fstyler FG10 is a dependable 2.4GHz wireless mouse designed with an ergonomic anti-slippery side grip. Features adjustable 2000 DPI sensor, 10-15 meter wireless range, 4-level auto power saving sleep modes, and 5 million clicks durable micro-switches.',
      sellingPrice: 850,
      compareAtPrice: 950,
      costPrice: 700,
      stock: 35,
      lowStockThreshold: 6,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      warrantyInfo: '1 Year Warranty',
      categorySlug: 'computer-accessories',
      brandSlug: 'a4tech',
      imageUrl: '/products/a4tech-fg10-mouse.svg',
      specs: [
        { group: 'Wireless System', key: 'Transmission', value: '2.4GHz Wireless with 10-15m Range' },
        { group: 'Sensor', key: 'Adjustable DPI', value: '1000-1600-2000 DPI Optical Engine' },
        { group: 'Battery Life', key: 'Power Saving', value: 'Up to 12 Months with Auto 4-Level Sleep' },
        { group: 'Ergonomics', key: 'Design', value: 'Symmetric Anti-Slippery Comfort Grip' },
      ],
    },
  ];

  let seededCount = 0;
  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    const brandId = brandMap.get(item.brandSlug);

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        description: item.description,
        sellingPrice: item.sellingPrice,
        compareAtPrice: item.compareAtPrice,
        costPrice: item.costPrice,
        stock: item.stock,
        lowStockThreshold: item.lowStockThreshold,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        isBestSeller: item.isBestSeller,
        isActive: true,
        warrantyInfo: item.warrantyInfo,
        categoryId,
        brandId,
      },
      create: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        barcode: item.barcode,
        description: item.description,
        sellingPrice: item.sellingPrice,
        compareAtPrice: item.compareAtPrice,
        costPrice: item.costPrice,
        stock: item.stock,
        lowStockThreshold: item.lowStockThreshold,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        isBestSeller: item.isBestSeller,
        isActive: true,
        warrantyInfo: item.warrantyInfo,
        categoryId,
        brandId,
      },
    });

    // Upsert Primary Product Image
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.imageUrl,
        altText: item.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    // Upsert Specifications
    await prisma.productSpecification.deleteMany({
      where: { productId: product.id },
    });
    if (item.specs && item.specs.length > 0) {
      await prisma.productSpecification.createMany({
        data: item.specs.map((s, idx) => ({
          productId: product.id,
          group: s.group,
          key: s.key,
          value: s.value,
          sortOrder: idx,
        })),
      });
    }

    // Record initial stock inventory movement ledger if not already recorded
    const existingMovement = await prisma.inventoryMovement.findFirst({
      where: {
        productId: product.id,
        referenceId: 'INITIAL-STOCK-2026',
      },
    });

    if (!existingMovement) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'INITIAL',
          quantity: item.stock,
          previousStock: 0,
          newStock: item.stock,
          reason: 'Initial verified showroom inventory balance',
          referenceId: 'INITIAL-STOCK-2026',
          createdByUserId: ownerUser.id,
        },
      });
    }

    seededCount++;
    console.log(`✓ Product synced [${product.sku}]: ${product.name}`);
  }
  console.log(`✓ Total ${seededCount} authentic products successfully populated.`);

  // 6. Banners
  console.log('6. Upserting Store Promotion Banners...');
  const bannersData = [
    {
      title: 'TECH MEGA DEAL FEST',
      subtitle: 'Special discounts & official warranty on laptops, CCTV & computer accessories',
      desktopImageUrl: '/images/hero-banner-1.jpg',
      buttonText: 'Shop Tech Deals',
      buttonUrl: '/products?offer=true',
      type: 'PROMOTIONAL',
      priority: 10,
    },
    {
      title: 'HIGH PERFORMANCE PC & CCTV SOLUTIONS',
      subtitle: 'Trusted computer showroom & surveillance installation in Moulvibazar',
      desktopImageUrl: '/images/hero-banner-2.jpg',
      buttonText: 'Explore CCTV & PC',
      buttonUrl: '/categories/cctv-surveillance',
      type: 'PROMOTIONAL',
      priority: 5,
    },
  ];

  for (const b of bannersData) {
    const existingBanner = await prisma.banner.findFirst({
      where: { title: b.title },
    });
    if (existingBanner) {
      await prisma.banner.update({
        where: { id: existingBanner.id },
        data: { ...b, isActive: true },
      });
    } else {
      await prisma.banner.create({
        data: { ...b, isActive: true },
      });
    }
  }
  console.log('✓ Promotional banners synced.');

  console.log('------------------------------------------------------------');
  console.log('🎉 Trust Computer database successfully synchronized with REAL data!');
  console.log('------------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
