/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Rewrite /admin/* → /caba-italie/* (keeps folder name, exposes /admin route)
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/caba-italie',
      },
      {
        source: '/admin/:path*',
        destination: '/caba-italie/:path*',
      },
    ];
  },

  // SEO-friendly redirects: old brand URLs → new canonical paths
  async redirects() {
    return [
      // Redirect bare /caba-italie to /admin so bookmarks still work
      {
        source: '/caba-italie',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/caba-italie/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
    ];
  },

  // Security & SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
