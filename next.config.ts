import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Unsplash URLs already include CDN optimization params (auto=format&w=1200&q=80),
    // so we skip Next.js' optimizer. This also avoids the image optimizer failing in
    // the Amplify production runtime, which left product images broken.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
