/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: [
      "res.cloudinary.com", // ✅ Cloudinary
      "localhost", // ✅ Local development
      "example.com", // ✅ Any other CDN or domain
    ],
  },
};

export default nextConfig;
