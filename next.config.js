/** @type {import('next').NextConfig} */

const prod = process.env.NODE_ENV === "production";

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    // disable: prod ? false : true,
    skipWaiting: true,
});
// https://sa-east-1.graphassets.com/AqOBjEm30Q4qkB2iS7dgQz/XhYEQG9KR8adWj0TIGn2

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [
            "sa-east-1.graphassets.com",
            "media.graphassets.com",
            "lh3.googleusercontent.com",
        ],
    },
    experimental: {
        workerThreads: false,
        cpus: 1,
    },
    redirects() {
        return [
            process.env.MAINTENANCE_MODE === "1"
                ? {
                      source: "/((?!maintenance).*)",
                      destination: "/maintenance.html",
                      permanent: false,
                  }
                : null,
        ].filter(Boolean);
    },
    serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push("@sparticuz/chromium");
        }
        return config;
    },
};

module.exports = withPWA(nextConfig);
