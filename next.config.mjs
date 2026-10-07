/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1200],
    imageSizes: [80, 120, 160, 240, 320, 480],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mashtelat-hair.vercel.app" }],
        destination: "https://mashtelathair.co.il/:path*",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
