const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const productSvgs = {
  'hikvision-colorvu-bullet.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="lens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>
  
  <!-- Stand / Mounting Bracket -->
  <g filter="url(#shadow)">
    <!-- Base Plate -->
    <circle cx="210" cy="530" r="60" fill="url(#metal)" stroke="#cbd5e1" stroke-width="4"/>
    <circle cx="210" cy="530" r="45" fill="#f8fafc"/>
    <circle cx="210" cy="530" r="16" fill="#64748b"/>
    <circle cx="175" cy="510" r="6" fill="#94a3b8"/>
    <circle cx="245" cy="510" r="6" fill="#94a3b8"/>
    <circle cx="210" cy="565" r="6" fill="#94a3b8"/>
    
    <!-- Articulated Arm -->
    <path d="M210,510 L310,430 L380,450" fill="none" stroke="url(#metal)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="310" cy="430" r="22" fill="#64748b"/>

    <!-- Sunshield Top Visor -->
    <path d="M300,280 L620,240 Q640,240 645,260 L620,300 L300,320 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>

    <!-- Camera Body Cylinder -->
    <rect x="310" y="290" width="310" height="150" rx="20" fill="url(#metal)" stroke="#cbd5e1" stroke-width="3"/>
    
    <!-- Red Accent Stripe -->
    <rect x="560" y="290" width="12" height="150" fill="#E91D26"/>
    
    <!-- Front Bezel -->
    <ellipse cx="620" cy="365" rx="30" ry="75" fill="#1e293b"/>
    <!-- Glass Lens Area -->
    <ellipse cx="620" cy="365" rx="22" ry="55" fill="url(#lens)"/>
    <ellipse cx="620" cy="365" rx="10" ry="25" fill="#38bdf8" opacity="0.6"/>
    <circle cx="622" cy="355" r="5" fill="#ffffff" opacity="0.8"/>
    
    <!-- ColorVu Warm LED Lights -->
    <circle cx="615" cy="315" r="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <circle cx="615" cy="415" r="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    
    <!-- Hikvision Logo on Camera Body -->
    <text x="350" y="375" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#0f172a" letter-spacing="2">HIKVISION</text>
    <text x="350" y="405" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#E91D26" letter-spacing="3">ColorVu 2MP Full-Time Color</text>
  </g>
</svg>`,

  'hikvision-colorvu-dome.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Dome Camera Assembly -->
  <g filter="url(#shadow)">
    <!-- Base Ring -->
    <ellipse cx="400" cy="560" rx="260" ry="70" fill="#94a3b8"/>
    <ellipse cx="400" cy="550" rx="255" ry="65" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="4"/>
    <ellipse cx="400" cy="535" rx="240" ry="60" fill="url(#domeGrad)"/>

    <!-- Main Eyeball Turret Shell -->
    <path d="M220,500 C220,320 300,220 400,220 C500,220 580,320 580,500 Z" fill="url(#domeGrad)" stroke="#cbd5e1" stroke-width="3"/>
    
    <!-- Turret Inner Core (Black Face) -->
    <ellipse cx="400" cy="410" rx="140" ry="140" fill="#0f172a"/>
    <ellipse cx="400" cy="410" rx="125" ry="125" fill="#1e293b" stroke="#334155" stroke-width="3"/>
    
    <!-- ColorVu Lens -->
    <circle cx="400" cy="400" r="55" fill="url(#lensGrad)" stroke="#475569" stroke-width="4"/>
    <circle cx="400" cy="400" r="28" fill="#0284c7" opacity="0.6"/>
    <circle cx="408" cy="390" r="9" fill="#ffffff" opacity="0.8"/>
    
    <!-- Warm Supplemental Light LED -->
    <circle cx="400" cy="485" r="14" fill="#fef08a" stroke="#eab308" stroke-width="3"/>

    <!-- Red Accent Band -->
    <path d="M210,528 Q400,565 590,528" fill="none" stroke="#E91D26" stroke-width="6"/>

    <!-- Hikvision Branding -->
    <text x="400" y="275" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="#0f172a" letter-spacing="2">HIKVISION</text>
    <text x="400" y="300" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="13" fill="#E91D26" letter-spacing="2">ColorVu Turret Dome</text>
  </g>
</svg>`,

  'dahua-8ch-xvr.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="casing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="10%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="26" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- XVR 3D Box -->
  <g filter="url(#shadow)">
    <!-- Top Face (Perspective) -->
    <polygon points="120,380 240,260 680,260 560,380" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <!-- Top Vents -->
    <line x1="280" y1="280" x2="640" y2="280" stroke="#0f172a" stroke-width="3"/>
    <line x1="270" y1="300" x2="630" y2="300" stroke="#0f172a" stroke-width="3"/>
    <line x1="260" y1="320" x2="620" y2="320" stroke="#0f172a" stroke-width="3"/>
    <line x1="250" y1="340" x2="610" y2="340" stroke="#0f172a" stroke-width="3"/>

    <!-- Right Side Face -->
    <polygon points="560,380 680,260 680,360 560,490" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>

    <!-- Front Bezel -->
    <polygon points="120,380 560,380 560,490 120,490" fill="url(#casing)" stroke="#334155" stroke-width="3"/>

    <!-- Red Accent Indicator Line (Dahua style) -->
    <rect x="120" y="482" width="440" height="8" fill="#E91D26"/>

    <!-- Brand & Model -->
    <text x="150" y="425" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="3">alhua</text>
    <circle cx="137" cy="415" r="7" fill="#E91D26"/>
    <text x="150" y="450" font-family="system-ui, sans-serif" font-weight="700" font-size="13" fill="#38bdf8" letter-spacing="1.5">WizSense AI 8-CHANNEL XVR</text>

    <!-- Front USB Port -->
    <rect x="490" y="415" width="28" height="12" rx="2" fill="#0284c7" stroke="#64748b" stroke-width="1.5"/>

    <!-- LED Status Indicators -->
    <circle cx="430" cy="421" r="5" fill="#22c55e"/> <!-- PWR -->
    <circle cx="450" cy="421" r="5" fill="#3b82f6"/> <!-- NET -->
    <circle cx="470" cy="421" r="5" fill="#eab308"/> <!-- HDD -->

    <text x="430" y="442" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">PWR</text>
    <text x="450" y="442" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">NET</text>
    <text x="470" y="442" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">HDD</text>
  </g>
</svg>`,

  'wd-purple-2tb.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="hddMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="22" stdDeviation="24" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- 3.5" Hard Drive Body -->
  <g filter="url(#shadow)">
    <!-- Base Cast Metal Chassis -->
    <rect x="200" y="140" width="400" height="520" rx="20" fill="url(#hddMetal)" stroke="#64748b" stroke-width="4"/>
    
    <!-- Top Recessed Cover -->
    <rect x="220" y="160" width="360" height="480" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- Corner Screws -->
    <circle cx="235" cy="175" r="8" fill="#64748b"/>
    <circle cx="565" cy="175" r="8" fill="#64748b"/>
    <circle cx="235" cy="625" r="8" fill="#64748b"/>
    <circle cx="565" cy="625" r="8" fill="#64748b"/>

    <!-- WD Purple Official Label -->
    <!-- Purple Top Header Bar -->
    <path d="M230,190 L570,190 L570,300 L230,300 Z" fill="#7e22ce"/>
    
    <!-- Western Digital Brand -->
    <text x="260" y="240" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="1">Western Digital®</text>
    <text x="260" y="280" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="#f3e8ff" letter-spacing="3">WD PURPLE™</text>
    
    <!-- Surveillance Drive Badge -->
    <rect x="440" y="210" width="115" height="30" rx="6" fill="#ffffff"/>
    <text x="497" y="230" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#7e22ce">SURVEILLANCE</text>

    <!-- Capacity Specs Section -->
    <rect x="230" y="300" width="340" height="300" fill="#ffffff"/>
    
    <text x="260" y="370" font-family="system-ui, sans-serif" font-weight="900" font-size="52" fill="#0f172a">2.0 TB</text>
    <text x="260" y="410" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#475569">WD20PURZ • SATA 6 Gb/s • 64MB Cache</text>
    <text x="260" y="440" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#7e22ce">AllFrame™ 4K Technology • 24x7 Reliability</text>
    
    <!-- Barcode & QR Simulation -->
    <rect x="260" y="475" width="280" height="40" fill="#0f172a"/>
    <line x1="270" y1="475" x2="270" y2="515" stroke="#ffffff" stroke-width="4"/>
    <line x1="285" y1="475" x2="285" y2="515" stroke="#ffffff" stroke-width="6"/>
    <line x1="310" y1="475" x2="310" y2="515" stroke="#ffffff" stroke-width="3"/>
    <line x1="330" y1="475" x2="330" y2="515" stroke="#ffffff" stroke-width="8"/>
    <line x1="360" y1="475" x2="360" y2="515" stroke="#ffffff" stroke-width="5"/>
    <line x1="390" y1="475" x2="390" y2="515" stroke="#ffffff" stroke-width="7"/>
    <line x1="430" y1="475" x2="430" y2="515" stroke="#ffffff" stroke-width="4"/>
    <line x1="460" y1="475" x2="460" y2="515" stroke="#ffffff" stroke-width="9"/>
    <line x1="500" y1="475" x2="500" y2="515" stroke="#ffffff" stroke-width="3"/>

    <text x="400" y="550" text-anchor="middle" font-family="monospace" font-size="13" fill="#64748b">S/N: WCC4M7TC2026MB • TRUST COMPUTER VERIFIED</text>
  </g>
</svg>`,

  'tplink-archer-c6.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="routerBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- 4 Antennas Standing -->
  <g stroke="#1e293b" stroke-width="16" stroke-linecap="round">
    <!-- Antenna 1 (Far Left) -->
    <line x1="200" y1="440" x2="150" y2="180"/>
    <!-- Antenna 2 (Inner Left) -->
    <line x1="320" y1="400" x2="300" y2="150"/>
    <!-- Antenna 3 (Inner Right) -->
    <line x1="480" y1="400" x2="500" y2="150"/>
    <!-- Antenna 4 (Far Right) -->
    <line x1="600" y1="440" x2="650" y2="180"/>
  </g>

  <!-- Router Main Unit -->
  <g filter="url(#shadow)">
    <!-- Main Diamond Pattern Body -->
    <polygon points="160,490 280,420 520,420 640,490 520,560 280,560" fill="url(#routerBody)" stroke="#334155" stroke-width="3"/>

    <!-- Diamond Texture Facets -->
    <polygon points="280,420 400,450 400,530 280,560" fill="#1e293b" opacity="0.6"/>
    <polygon points="520,420 400,450 400,530 520,560" fill="#0f172a" opacity="0.8"/>
    <polygon points="160,490 280,420 400,450 280,560" fill="#334155" opacity="0.4"/>
    <polygon points="640,490 520,420 400,450 520,560" fill="#020617" opacity="0.7"/>

    <!-- TP-Link Brand Logo Center -->
    <circle cx="400" cy="490" r="32" fill="#0f172a" stroke="#0084d6" stroke-width="2"/>
    <text x="400" y="496" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#38bdf8" letter-spacing="1">tp-link</text>

    <!-- Front Green LED Light Indicators -->
    <g fill="#22c55e">
      <circle cx="340" cy="542" r="3"/>
      <circle cx="360" cy="542" r="3"/>
      <circle cx="380" cy="542" r="3"/>
      <circle cx="400" cy="542" r="3"/>
      <circle cx="420" cy="542" r="3"/>
      <circle cx="440" cy="542" r="3"/>
    </g>

    <!-- Badge info -->
    <text x="400" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#0f172a">Archer C6 AC1200</text>
    <text x="400" y="645" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#0084d6">MU-MIMO Full Gigabit Dual-Band Wi-Fi</text>
  </g>
</svg>`,

  'tplink-8port-switch.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Desktop Switch Body -->
  <g filter="url(#shadow)">
    <!-- Switch Box -->
    <rect x="150" y="320" width="500" height="190" rx="16" fill="#1e293b" stroke="#334155" stroke-width="3"/>
    
    <!-- Top Face highlight -->
    <path d="M150,336 Q150,320 166,320 L634,320 Q650,320 650,336 L650,350 L150,350 Z" fill="#334155"/>

    <!-- TP-Link Brand -->
    <text x="180" y="385" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="#38bdf8" letter-spacing="1">tp-link</text>
    <text x="180" y="405" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">TL-SG1008D 8-Port Gigabit Switch</text>

    <!-- 8 RJ45 Ports -->
    <g transform="translate(180, 420)">
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
        <rect x="${i * 56}" y="0" width="44" height="48" rx="6" fill="#0f172a" stroke="#475569" stroke-width="2"/>
        <rect x="${i * 56 + 8}" y="20" width="28" height="22" rx="3" fill="#0284c7" opacity="0.8"/>
        <!-- Port number and LED -->
        <circle cx="${i * 56 + 22}" cy="-10" r="3.5" fill="#22c55e"/>
        <text x="${i * 56 + 22}" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#94a3b8">${i + 1}</text>
      `).join('')}
    </g>
  </g>
</svg>`,

  'intel-i5-12400.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="pcb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="ihs" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- CPU LGA 1700 -->
  <g filter="url(#shadow)">
    <!-- Substrate PCB (Blue) -->
    <rect x="220" y="160" width="360" height="480" rx="12" fill="url(#pcb)" stroke="#0284c7" stroke-width="4"/>

    <!-- Gold Corner Alignment Triangle -->
    <polygon points="230,170 260,170 230,200" fill="#fbbf24"/>

    <!-- Nickel Integrated Heat Spreader (IHS) -->
    <rect x="250" y="190" width="300" height="420" rx="16" fill="url(#ihs)" stroke="#94a3b8" stroke-width="3"/>
    
    <!-- IHS Edge Wings (LGA 1700 rectangular shape) -->
    <path d="M250,250 L240,260 L240,320 L250,330" fill="none" stroke="#94a3b8" stroke-width="3"/>
    <path d="M550,250 L560,260 L560,320 L550,330" fill="none" stroke="#94a3b8" stroke-width="3"/>

    <!-- Laser Etching Text on IHS -->
    <text x="400" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="#006699" letter-spacing="3">intel®</text>
    <text x="400" y="325" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="38" fill="#0f172a" letter-spacing="1">CORE™ i5</text>
    <text x="400" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="22" fill="#334155">i5-12400</text>
    
    <text x="400" y="420" text-anchor="middle" font-family="monospace" font-size="13" fill="#475569">SRL5Y 2.50GHz</text>
    <text x="400" y="445" text-anchor="middle" font-family="monospace" font-size="13" fill="#475569">MALAY X238F923</text>
    <text x="400" y="480" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#0284c7">12th Gen Alder Lake • LGA1700</text>
    
    <!-- 2D DataMatrix Simulation -->
    <rect x="365" y="515" width="70" height="70" fill="#0f172a" rx="4"/>
    <rect x="375" y="525" width="20" height="20" fill="#ffffff"/>
    <rect x="405" y="525" width="20" height="20" fill="#ffffff"/>
    <rect x="375" y="555" width="20" height="20" fill="#ffffff"/>
    <circle cx="415" cy="565" r="5" fill="#ffffff"/>
  </g>
</svg>`,

  'asus-h610m-k.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Motherboard PCB -->
  <g filter="url(#shadow)">
    <!-- Dark Black PCB -->
    <rect x="180" y="150" width="440" height="500" rx="16" fill="#0b0f19" stroke="#1e293b" stroke-width="4"/>

    <!-- VRM Heatsink & IO Shield -->
    <rect x="200" y="170" width="70" height="150" rx="6" fill="#334155" stroke="#475569" stroke-width="2"/>
    <text x="235" y="250" text-anchor="middle" transform="rotate(-90 235 250)" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" letter-spacing="2">PRIME</text>

    <!-- CPU Socket LGA1700 -->
    <rect x="300" y="190" width="140" height="150" rx="8" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="315" y="205" width="110" height="120" rx="4" fill="#0f172a"/>
    <circle cx="370" cy="265" r="14" fill="#64748b"/>

    <!-- 2x DDR4 RAM Slots -->
    <rect x="475" y="180" width="22" height="240" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <rect x="510" y="180" width="22" height="240" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>

    <!-- PCIe x16 Slot (Safeslot Core) -->
    <rect x="240" y="440" width="280" height="26" rx="4" fill="#0f172a" stroke="#e2e8f0" stroke-width="3"/>
    <rect x="240" y="485" width="120" height="20" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="2"/>

    <!-- M.2 NVMe Slot -->
    <rect x="270" y="380" width="160" height="26" rx="4" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="350" y="398" text-anchor="middle" font-family="monospace" font-size="10" fill="#38bdf8">M.2 PCIe 4.0 x4</text>

    <!-- Chipset Heatsink (Asus Prime Logo) -->
    <rect x="450" y="470" width="110" height="110" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <text x="505" y="525" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" letter-spacing="2">ASUS</text>
    <text x="505" y="545" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#38bdf8">PRIME H610</text>
  </g>
</svg>`,

  'corsair-16gb-ram.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="26" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- RAM Stick Horizontal -->
  <g filter="url(#shadow)">
    <!-- Black Aluminum Heat Spreader -->
    <rect x="100" y="310" width="600" height="180" rx="12" fill="#0f172a" stroke="#334155" stroke-width="3"/>

    <!-- Top Heat Fins Cutout -->
    <g fill="#1e293b">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `
        <rect x="${140 + i * 44}" y="295" width="24" height="24" rx="4"/>
      `).join('')}
    </g>

    <!-- Center Badge (Corsair Yellow Accent) -->
    <rect x="250" y="350" width="300" height="80" rx="8" fill="#020617" stroke="#fbbf24" stroke-width="2"/>
    <text x="400" y="385" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#ffffff" letter-spacing="4">CORSAIR</text>
    <text x="400" y="415" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#fbbf24" letter-spacing="2">VENGEANCE LPX</text>

    <!-- Gold Contact Pins -->
    <rect x="120" y="490" width="560" height="30" fill="#047857"/>
    <!-- Pins (Left & Right divided by notch) -->
    <g fill="#eab308">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => `
        <rect x="${130 + i * 16}" y="495" width="8" height="20" rx="1"/>
      `).join('')}
      <!-- Center Key Notch at x=395 -->
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => `
        <rect x="${415 + i * 16}" y="495" width="8" height="20" rx="1"/>
      `).join('')}
    </g>

    <!-- Specs Text Below -->
    <text x="400" y="570" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#0f172a">16GB DDR4 3200MHz</text>
    <text x="400" y="595" text-anchor="middle" font-family="monospace" font-size="14" fill="#64748b">CL16-20-20-38 1.35V XMP 2.0</text>
  </g>
</svg>`,

  'samsung-980-ssd.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- M.2 2280 Stick -->
  <g filter="url(#shadow)">
    <!-- Black PCB -->
    <rect x="140" y="320" width="520" height="160" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="3"/>
    
    <!-- Left Mounting Semicircle Notch -->
    <circle cx="140" cy="400" r="16" fill="#f1f5f9"/>

    <!-- Right Gold Pin Connector (M-Key) -->
    <rect x="635" y="335" width="25" height="130" fill="#065f46"/>
    <g fill="#eab308">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `
        <rect x="645" y="${345 + i * 9}" width="12" height="5" rx="1"/>
      `).join('')}
    </g>

    <!-- Samsung Heat Spreader Sticker -->
    <rect x="180" y="335" width="440" height="130" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>

    <!-- Samsung Brand & Model -->
    <text x="210" y="380" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">SAMSUNG</text>
    <text x="210" y="420" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="#38bdf8">980</text>
    <text x="290" y="420" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#94a3b8">NVMe M.2 SSD</text>

    <!-- Capacity Badge -->
    <rect x="490" y="355" width="110" height="40" rx="6" fill="#0284c7"/>
    <text x="545" y="382" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#ffffff">500 GB</text>

    <text x="210" y="450" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#64748b">PCIe 3.0 x4 • Sequential Read Up to 3,100 MB/s</text>
  </g>
</svg>`,

  'hp-15s-laptop.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Laptop Open View -->
  <g filter="url(#shadow)">
    <!-- Screen Lid (Upright) -->
    <rect x="190" y="160" width="420" height="280" rx="14" fill="#0f172a" stroke="#cbd5e1" stroke-width="4"/>
    
    <!-- Screen Display (FHD IPS) -->
    <rect x="205" y="175" width="390" height="245" rx="6" fill="#1e293b"/>
    <!-- Wallpaper Gradient on screen -->
    <rect x="205" y="175" width="390" height="245" rx="6" fill="url(#bg)" opacity="0.1"/>
    
    <!-- Windows Desktop Brand Simulation -->
    <circle cx="400" cy="275" r="40" fill="#0284c7" opacity="0.8"/>
    <text x="400" y="340" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff">hp 15s</text>
    <text x="400" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#93c5fd">Intel Core i3 12th Gen • 8GB • 512GB SSD</text>

    <!-- Webcam dot -->
    <circle cx="400" cy="167" r="3" fill="#64748b"/>

    <!-- Keyboard Base (Perspective) -->
    <polygon points="120,560 680,560 620,440 180,440" fill="url(#silver)" stroke="#94a3b8" stroke-width="3"/>

    <!-- Keyboard Recess -->
    <polygon points="190,500 610,500 580,450 220,450" fill="#334155" rx="6"/>
    <!-- Keys rows -->
    <line x1="220" y1="465" x2="580" y2="465" stroke="#1e293b" stroke-width="6"/>
    <line x1="210" y1="480" x2="590" y2="480" stroke="#1e293b" stroke-width="6"/>

    <!-- Trackpad -->
    <rect x="340" y="515" width="120" height="35" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- HP Slash Logo on Chin -->
    <circle cx="400" cy="430" r="10" fill="#0284c7"/>
    <text x="400" y="434" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="10" fill="#ffffff">hp</text>
  </g>
</svg>`,

  'asus-vp228he-monitor.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Monitor Assembly -->
  <g filter="url(#shadow)">
    <!-- Stand Base (Circular) -->
    <ellipse cx="400" cy="620" rx="140" ry="30" fill="#1e293b" stroke="#334155" stroke-width="3"/>
    <ellipse cx="400" cy="615" rx="130" ry="25" fill="#0f172a"/>

    <!-- Stand Neck -->
    <polygon points="380,480 420,480 415,615 385,615" fill="#1e293b" stroke="#334155" stroke-width="2"/>

    <!-- Screen Bezel -->
    <rect x="140" y="180" width="520" height="320" rx="14" fill="#0f172a" stroke="#334155" stroke-width="4"/>
    
    <!-- Active Display Panel -->
    <rect x="155" y="195" width="490" height="275" rx="6" fill="#1e293b"/>
    <rect x="155" y="195" width="490" height="275" rx="6" fill="#0284c7" opacity="0.1"/>

    <!-- On-screen graphics -->
    <text x="400" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">ASUS Eye Care</text>
    <text x="400" y="355" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#38bdf8">21.5" Full HD (1920x1080) • 75Hz • 1ms</text>
    
    <!-- Asus Logo Center Bottom Bezel -->
    <text x="400" y="490" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#ffffff" letter-spacing="2">ASUS</text>
  </g>
</svg>`,

  'fantech-kx302-combo.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="rgb" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="75%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="26" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Combo: Keyboard + Mouse -->
  <g filter="url(#shadow)">
    <!-- Keyboard Body -->
    <rect x="100" y="240" width="460" height="280" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
    
    <!-- RGB Backlight Rim Under Keys -->
    <rect x="115" y="255" width="430" height="250" rx="10" fill="none" stroke="url(#rgb)" stroke-width="4" opacity="0.9"/>

    <!-- Keycaps Layout Matrix -->
    <g fill="#1e293b" stroke="#334155" stroke-width="1">
      ${[0, 1, 2, 3].map(row => 
        [0, 1, 2, 3, 4, 5, 6, 7].map(col => `
          <rect x="${130 + col * 50}" y="${275 + row * 45}" width="42" height="38" rx="5"/>
        `).join('')
      ).join('')}
    </g>
    <!-- Spacebar -->
    <rect x="230" y="455" width="200" height="38" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>

    <!-- Fantech Logo on Keyboard -->
    <text x="130" y="478" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#ef4444" letter-spacing="1">FANTECH</text>

    <!-- Gaming Mouse -->
    <path d="M600,320 C640,320 670,360 670,420 C670,490 640,540 600,540 C560,540 530,490 530,420 C530,360 560,320 600,320 Z" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
    
    <!-- RGB Strip on Mouse Spine -->
    <path d="M600,335 L600,515" stroke="url(#rgb)" stroke-width="4" stroke-linecap="round"/>
    
    <!-- Scroll Wheel -->
    <rect x="594" y="345" width="12" height="30" rx="4" fill="#38bdf8"/>

    <!-- Label -->
    <text x="400" y="610" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#0f172a">Fantech MAJOR KX-302</text>
    <text x="400" y="635" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ef4444">RGB Backlit Gaming Keyboard &amp; Mouse Combo</text>
  </g>
</svg>`,

  'a4tech-fg10-mouse.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <linearGradient id="mouseBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" rx="32"/>

  <!-- Wireless Mouse -->
  <g filter="url(#shadow)">
    <!-- Ergonomic Oval Mouse Shell -->
    <path d="M400,180 C490,180 540,260 540,420 C540,560 480,620 400,620 C320,620 260,560 260,420 C260,260 310,180 400,180 Z" fill="url(#mouseBody)" stroke="#475569" stroke-width="4"/>

    <!-- Anti-slip Blue/Orange Accent Side Grip -->
    <path d="M260,340 C280,380 280,460 260,500" stroke="#0084d6" stroke-width="12" stroke-linecap="round"/>
    <path d="M540,340 C520,380 520,460 540,500" stroke="#0084d6" stroke-width="12" stroke-linecap="round"/>

    <!-- Left / Right Click Split -->
    <line x1="400" y1="180" x2="400" y2="340" stroke="#0f172a" stroke-width="4"/>

    <!-- Rubber Scroll Wheel -->
    <rect x="390" y="240" width="20" height="50" rx="6" fill="#0284c7" stroke="#cbd5e1" stroke-width="2"/>

    <!-- DPI Button -->
    <rect x="393" y="315" width="14" height="20" rx="3" fill="#64748b"/>

    <!-- A4Tech Fstyler Brand Palm Logo -->
    <text x="400" y="490" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="2">A4TECH</text>
    <text x="400" y="515" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="13" fill="#38bdf8" letter-spacing="1">FSTYLER FG10</text>
    <text x="400" y="545" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">2.4G Wireless 2000 DPI</text>

    <!-- Tiny Nano USB Dongle floating nearby -->
    <g transform="translate(560, 480)">
      <rect x="0" y="0" width="40" height="24" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
      <rect x="32" y="4" width="18" height="16" rx="2" fill="#cbd5e1"/>
      <text x="16" y="16" text-anchor="middle" font-family="monospace" font-size="8" fill="#ffffff">USB</text>
    </g>
  </g>
</svg>`
};

console.log('Generating crisp professional product visual assets...');
for (const [filename, svg] of Object.entries(productSvgs)) {
  const filePath = path.join(productsDir, filename);
  fs.writeFileSync(filePath, svg.trim(), 'utf-8');
  console.log(`✓ Created: /public/products/${filename}`);
}

console.log('All product visual assets generated successfully.');
