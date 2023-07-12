/** @type {import('next').NextConfig} */

const prod = process.env.NODE_ENV === "production";

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    // disable: prod ? false : true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ["media.graphassets.com", "lh3.googleusercontent.com"],
    },
    experimental: {
        workerThreads: false,
        cpus: 1,
    },
};

module.exports = withPWA(nextConfig);
