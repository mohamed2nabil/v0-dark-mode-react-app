/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/v0-dark-mode-react-app",
  assetPrefix: "/v0-dark-mode-react-app/",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
