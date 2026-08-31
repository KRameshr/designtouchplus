/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — real portfolio/blog images and videos will be hosted here
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Placeholder images used during development (DevDataSeeder sample data)
      { protocol: "https", hostname: "placehold.co" },
      // Temporary realistic-looking thumbnails until real Cloudinary videos
      // are uploaded (see plan: dummy images now, real videos added later)
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
