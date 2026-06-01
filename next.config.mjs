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
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          pathname: '/**',
        },
      ],
    },
    compiler: {
      // En producción elimina todos los console.* excepto console.error
      removeConsole: process.env.NODE_ENV === 'production'
        ? { exclude: ['error'] }
        : false,
    },
  };

  export default nextConfig;
  