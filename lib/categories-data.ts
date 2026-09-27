export interface StoreCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  icon?: string;
}

export const DEFAULT_CATEGORIES: StoreCategoryItem[] = [
  {
    id: '812fb860-ff77-41e8-9b54-e71f445d7ce8',
    name: 'Laptop & Computer',
    slug: 'laptop-computer',
    description: 'Brand new laptops, desktop computers, all-in-one PCs and computing solutions with official warranty in Moulvibazar.',
    sortOrder: 1,
    icon: '💻',
  },
  {
    id: 'ba548f51-c7b9-4b01-8f46-bbffb934b2a5',
    name: 'Monitor',
    slug: 'monitor',
    description: 'Full HD, 2K and 4K monitors with Eye Care technology, gaming displays and office screens with HDMI/VGA connectivity.',
    sortOrder: 2,
    icon: '🖥️',
  },
  {
    id: 'e595cce4-c779-4c3d-b4e8-32c2e6dcaf2b',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Gaming PCs, gaming laptops, graphics cards, RGB peripherals, gaming chairs and high-performance gaming gear.',
    sortOrder: 3,
    icon: '🎮',
  },
  {
    id: 'deb336f8-ff2f-4ee1-8648-18a1728ee2c3',
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Keyboards, mouse, headphones, webcams, USB hubs, cables, cooling pads and essential computer accessories.',
    sortOrder: 4,
    icon: '🖱️',
  },
  {
    id: '51fe1370-3699-4ea9-96e4-529f6d5937df',
    name: 'CCTV & Security',
    slug: 'cctv-security',
    description: 'IP cameras, HD analog cameras, DVRs, NVRs, surveillance hard drives and complete CCTV security systems.',
    sortOrder: 5,
    icon: '📹',
  },
  {
    id: 'e5ff0328-2fbf-42f3-9f3e-82acbc395dd4',
    name: 'Networking',
    slug: 'networking',
    description: 'Wi-Fi routers, network switches, access points, Cat6 cables, fiber connectors and networking infrastructure.',
    sortOrder: 6,
    icon: '📡',
  },
  {
    id: '5838cdd3-90b5-4783-885c-3d0e9298024c',
    name: 'Power & Electronics',
    slug: 'power-electronics',
    description: 'UPS, IPS, voltage stabilizers, power strips, solar solutions and electronic components.',
    sortOrder: 7,
    icon: '🔌',
  },
];
