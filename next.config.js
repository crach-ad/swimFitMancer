/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // If it's a client-side bundle, add fallbacks for Node.js built-in modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        http2: false,
        zlib: false,
        path: false,
        stream: false,
        crypto: false,
        'node:http': false,
        'node:https': false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:events': false,
        'node:util': false,
        'node:stream': false,
        'node:buffer': false,
        'node:process': false,
        'node:path': false,
        'node:crypto': false,
      };
    }
    return config;
  },
  // Ensure that Next.js knows that googleapis, google-auth-library, and gaxios are server-only packages
  serverExternalPackages: ['googleapis', 'google-auth-library', 'gaxios'],
};

module.exports = nextConfig;
