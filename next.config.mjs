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
    // URLs viejas del panel admin -> estructura boleteria/{ferias,digital,fisica}.
    // No permanentes (307) para que el navegador no las guarde si se mueven otra vez
    async redirects() {
      return [
        { source: '/admin/boleteria', destination: '/admin/boleteria/digital', permanent: false },
        { source: '/admin/boleteria_fisica/:path*', destination: '/admin/boleteria/fisica/:path*', permanent: false },
        { source: '/admin/events', destination: '/admin/boleteria/ferias', permanent: false },
      ];
    },
  };

  export default nextConfig;
  