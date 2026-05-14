/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/company/analyze', destination: 'http://localhost:4000/company/analyze' },
      { source: '/api/market', destination: 'http://localhost:4000/market' },
    ];
  },
};

module.exports = nextConfig;