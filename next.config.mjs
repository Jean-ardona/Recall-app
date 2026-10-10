/** @type {import('next').NextConfig} */
const nextConfig = {
  // unpdf ships an ESM-only WASM bundle — keep it external so Next.js
  // doesn't try to bundle it through webpack.
  serverExternalPackages: ['unpdf'],
};

export default nextConfig;
