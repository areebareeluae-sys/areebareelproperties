/** @type {import('next').NextConfig} */
const nextConfig = {
      images: {
    qualities: [75, 100],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  allowedDevOrigins: [
    '192.168.1.4',
    'localhost:3000',
    '192.168.1.4:3000',
  ],
};

export default nextConfig;
