/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: 'https://clearance-management-system-backend.vercel.app/api',
  },
  // Ensure images from Cloudinary can be displayed
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Disable ESLint during build to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
