/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'xkwybhxcytfhnqrdvcel.supabase.co',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  