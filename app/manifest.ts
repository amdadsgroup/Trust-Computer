import { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.officialFullName,
    short_name: brand.shortName,
    description: brand.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: brand.colors.white,
    theme_color: brand.colors.primaryBlue,
    orientation: 'portrait-primary',
    icons: [
      {
        src: brand.assets.icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: brand.assets.icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: brand.assets.appleTouchIcon,
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
