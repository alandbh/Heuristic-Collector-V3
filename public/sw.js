if (!self.define) {
    let e,
        i = {};
    const c = (c, s) => (
        (c = new URL(c + ".js", s).href),
        i[c] ||
            new Promise((i) => {
                if ("document" in self) {
                    const e = document.createElement("script");
                    (e.src = c), (e.onload = i), document.head.appendChild(e);
                } else (e = c), importScripts(c), i();
            }).then(() => {
                let e = i[c];
                if (!e)
                    throw new Error(`Module ${c} didn’t register its module`);
                return e;
            })
    );
    self.define = (s, a) => {
        const n =
            e ||
            ("document" in self ? document.currentScript.src : "") ||
            location.href;
        if (i[n]) return;
        let t = {};
        const o = (e) => c(e, n),
            r = { module: { uri: n }, exports: t, require: o };
        i[n] = Promise.all(s.map((e) => r[e] || o(e))).then(
            (e) => (a(...e), t)
        );
    };
}
define(["./workbox-946f13af"], function (e) {
    "use strict";
    importScripts("worker-NLCGdvZZQYxrApCVNSPsN.js"),
        self.skipWaiting(),
        e.clientsClaim(),
        e.precacheAndRoute(
            [
                {
                    url: "/_next/static/NLCGdvZZQYxrApCVNSPsN/_buildManifest.js",
                    revision: "51e02d6476768a619fcec96b1a18a405",
                },
                {
                    url: "/_next/static/NLCGdvZZQYxrApCVNSPsN/_middlewareManifest.js",
                    revision: "468e9a0ecca0c65bcb0ee673b762445d",
                },
                {
                    url: "/_next/static/NLCGdvZZQYxrApCVNSPsN/_ssgManifest.js",
                    revision: "5352cb582146311d1540f6075d1f265e",
                },
                {
                    url: "/_next/static/chunks/221-7c79f5ec7f452166.js",
                    revision: "7c79f5ec7f452166",
                },
                {
                    url: "/_next/static/chunks/247-2032a8b079fe3626.js",
                    revision: "2032a8b079fe3626",
                },
                {
                    url: "/_next/static/chunks/283-9e5605a67b346c07.js",
                    revision: "9e5605a67b346c07",
                },
                {
                    url: "/_next/static/chunks/391-a77114551c793399.js",
                    revision: "a77114551c793399",
                },
                {
                    url: "/_next/static/chunks/511-532609a0bbe2af1f.js",
                    revision: "532609a0bbe2af1f",
                },
                {
                    url: "/_next/static/chunks/772-371b8afa9fa1a38f.js",
                    revision: "371b8afa9fa1a38f",
                },
                {
                    url: "/_next/static/chunks/c7bee1d7-f71565a132967840.js",
                    revision: "f71565a132967840",
                },
                {
                    url: "/_next/static/chunks/framework-d75e24402b5ef151.js",
                    revision: "d75e24402b5ef151",
                },
                {
                    url: "/_next/static/chunks/main-088fec45957db38b.js",
                    revision: "088fec45957db38b",
                },
                {
                    url: "/_next/static/chunks/pages/_app-31d03c132536567d.js",
                    revision: "31d03c132536567d",
                },
                {
                    url: "/_next/static/chunks/pages/_error-1c08ea246196f2ea.js",
                    revision: "1c08ea246196f2ea",
                },
                {
                    url: "/_next/static/chunks/pages/dashboard-ce2d5ddd4fd46bbb.js",
                    revision: "ce2d5ddd4fd46bbb",
                },
                {
                    url: "/_next/static/chunks/pages/index-5a4c65590be44f05.js",
                    revision: "5a4c65590be44f05",
                },
                {
                    url: "/_next/static/chunks/pages/login-082b062a29985d63.js",
                    revision: "082b062a29985d63",
                },
                {
                    url: "/_next/static/chunks/pages/project/%5Bslug%5D-244e2d104d9b67a9.js",
                    revision: "244e2d104d9b67a9",
                },
                {
                    url: "/_next/static/chunks/pages/projects-3effcc59306c55ad.js",
                    revision: "3effcc59306c55ad",
                },
                {
                    url: "/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",
                    revision: "99442aec5788bccac9b2f0ead2afdd6b",
                },
                {
                    url: "/_next/static/chunks/webpack-4686c99168ef1e4c.js",
                    revision: "4686c99168ef1e4c",
                },
                {
                    url: "/_next/static/css/92f80197c14cfaf8.css",
                    revision: "92f80197c14cfaf8",
                },
                {
                    url: "/_next/static/css/984ba444ea2a302f.css",
                    revision: "984ba444ea2a302f",
                },
                {
                    url: "/_next/static/media/ProductSans-Black.cdcaa6c8.woff",
                    revision: "cdcaa6c8",
                },
                {
                    url: "/_next/static/media/ProductSans-BlackItalic.7d9da765.woff",
                    revision: "7d9da765",
                },
                {
                    url: "/_next/static/media/ProductSans-Bold.b97831c7.woff",
                    revision: "b97831c7",
                },
                {
                    url: "/_next/static/media/ProductSans-BoldItalic.2d26d892.woff",
                    revision: "2d26d892",
                },
                {
                    url: "/_next/static/media/ProductSans-Italic.bb9e58df.woff",
                    revision: "bb9e58df",
                },
                {
                    url: "/_next/static/media/ProductSans-Light.71eb51b4.woff",
                    revision: "71eb51b4",
                },
                {
                    url: "/_next/static/media/ProductSans-LightItalic.a6e56d63.woff",
                    revision: "a6e56d63",
                },
                {
                    url: "/_next/static/media/ProductSans-Medium.0e4bec90.woff",
                    revision: "0e4bec90",
                },
                {
                    url: "/_next/static/media/ProductSans-MediumItalic.c48cd584.woff",
                    revision: "c48cd584",
                },
                {
                    url: "/_next/static/media/ProductSans-Regular.c8113152.woff",
                    revision: "c8113152",
                },
                {
                    url: "/_next/static/media/ProductSans-Thin.eaaf83df.woff",
                    revision: "eaaf83df",
                },
                {
                    url: "/_next/static/media/ProductSans-ThinItalic.9facbda5.woff",
                    revision: "9facbda5",
                },
                {
                    url: "/android-chrome-192x192.png",
                    revision: "dd292582b34506193da3a908f92c3113",
                },
                {
                    url: "/android-chrome-512x512.png",
                    revision: "fd04e1e7cfd2da2819e3bddaf8dbdbfa",
                },
                {
                    url: "/apple-touch-icon.png",
                    revision: "01be00ed6ec41321884af99e0ed545c4",
                },
                {
                    url: "/architecture.svg",
                    revision: "1830420d2a70e1fb5fe6f56fc8b89c78",
                },
                {
                    url: "/card-top.jpg",
                    revision: "5183bb28417b4291e5620d5c363cee86",
                },
                {
                    url: "/favicon-16x16.png",
                    revision: "970a7149b278cbd7836cc2128f37beb7",
                },
                {
                    url: "/favicon-32x32.png",
                    revision: "3e18efce5c1f272eb87a3c60923d7a49",
                },
                {
                    url: "/favicon.ico",
                    revision: "2b639e16145671ea63569e281acda2b9",
                },
                {
                    url: "/googlesheets.svg",
                    revision: "e81f2550420b2e2d59d6fc8f913b1587",
                },
                {
                    url: "/icons/favicon_io.zip",
                    revision: "225422c975947ef181872e03c9cb8510",
                },
                {
                    url: "/icons/favicon_io/android-chrome-192x192.png",
                    revision: "dd292582b34506193da3a908f92c3113",
                },
                {
                    url: "/icons/favicon_io/android-chrome-512x512.png",
                    revision: "fd04e1e7cfd2da2819e3bddaf8dbdbfa",
                },
                {
                    url: "/icons/favicon_io/apple-touch-icon.png",
                    revision: "01be00ed6ec41321884af99e0ed545c4",
                },
                {
                    url: "/icons/favicon_io/favicon-16x16.png",
                    revision: "970a7149b278cbd7836cc2128f37beb7",
                },
                {
                    url: "/icons/favicon_io/favicon-32x32.png",
                    revision: "3e18efce5c1f272eb87a3c60923d7a49",
                },
                {
                    url: "/icons/favicon_io/favicon.ico",
                    revision: "2b639e16145671ea63569e281acda2b9",
                },
                {
                    url: "/icons/favicon_io/site.webmanifest",
                    revision: "053100cb84a50d2ae7f5492f7dd7f25e",
                },
                {
                    url: "/icons/icon-192x192.png",
                    revision: "fcd0df3bd1d878232f55621b4c67e331",
                },
                {
                    url: "/icons/icon-256x256.png",
                    revision: "b2b8089a593d0dd0e10f4ba2670c57ee",
                },
                {
                    url: "/icons/icon-384x384.png",
                    revision: "fd0a0d6efc7a672c29688fc05cfc1de5",
                },
                {
                    url: "/icons/icon-512x512.png",
                    revision: "390c2e998b330ea1fe9bb896dcb4ddd5",
                },
                {
                    url: "/icons/maskable_icon.png",
                    revision: "fd04e1e7cfd2da2819e3bddaf8dbdbfa",
                },
                {
                    url: "/image-1.png",
                    revision: "e5527e68792886bd862fb07162214cc5",
                },
                {
                    url: "/img-empty-project.svg",
                    revision: "61639c535bce46bf8e79e14c9f9d8c8c",
                },
                {
                    url: "/logo-230.svg",
                    revision: "ef7d6711c029a6e1c80b8ad95e762a62",
                },
                {
                    url: "/logo-58.svg",
                    revision: "4ca03595db63d1b6768cdaf911abb897",
                },
                {
                    url: "/logo-finfacts-21.png",
                    revision: "c4ba36b2d7f8df584c441532c762c748",
                },
                {
                    url: "/logo-finfacts-23.png",
                    revision: "bc89f7b7076a3c5fabfdc1fc322e2d37",
                },
                {
                    url: "/logo-finfacts.png",
                    revision: "07ecdd6bc1b6514e451a5e5f40122fd4",
                },
                {
                    url: "/logo-flashback-23.png",
                    revision: "ed1b5b7b8d2f450c52beb995071e1796",
                },
                {
                    url: "/logo-white-35.svg",
                    revision: "15e329b0cdb05817b9c2af2d11dc7f90",
                },
                {
                    url: "/manifest.json",
                    revision: "eafd487df6a0b2622f7e013883ee7da0",
                },
                {
                    url: "/manifest.zip",
                    revision: "c4364898da470f522707d65c97505f83",
                },
                {
                    url: "/manifest/manifest.webmanifest",
                    revision: "b48d2431483e8e6a9e2a71b89a77e450",
                },
                {
                    url: "/sheet.png",
                    revision: "75c31f5bccc0ac546736752f2ae0cc28",
                },
                {
                    url: "/teste.png",
                    revision: "a89cd195f5cf610cf1b06188d0a4532a",
                },
                {
                    url: "/vercel.svg",
                    revision: "4b4f1876502eb6721764637fe5c41702",
                },
                {
                    url: "/video1.webm",
                    revision: "aefe67d1d25754f0ebbc66b4584c0079",
                },
                {
                    url: "/video1a.webm",
                    revision: "67a6505060e46fce65c38ff909c3f1cc",
                },
                {
                    url: "/video2.webm",
                    revision: "9512a0c18acea945a297be1632a9f986",
                },
                {
                    url: "/video3.webm",
                    revision: "f290e41226a308ca1d82ab2220d0d7fc",
                },
                {
                    url: "/video4.webm",
                    revision: "4802defb34cb5ef24f3bacc0e814d611",
                },
            ],
            { ignoreURLParametersMatching: [] }
        ),
        e.cleanupOutdatedCaches(),
        e.registerRoute(
            "/",
            new e.NetworkFirst({
                cacheName: "start-url",
                plugins: [
                    {
                        cacheWillUpdate: async ({
                            request: e,
                            response: i,
                            event: c,
                            state: s,
                        }) =>
                            i && "opaqueredirect" === i.type
                                ? new Response(i.body, {
                                      status: 200,
                                      statusText: "OK",
                                      headers: i.headers,
                                  })
                                : i,
                    },
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            new e.CacheFirst({
                cacheName: "google-fonts-webfonts",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 4,
                        maxAgeSeconds: 31536e3,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
            new e.StaleWhileRevalidate({
                cacheName: "google-fonts-stylesheets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 4,
                        maxAgeSeconds: 604800,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            new e.StaleWhileRevalidate({
                cacheName: "static-font-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 4,
                        maxAgeSeconds: 604800,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            new e.StaleWhileRevalidate({
                cacheName: "static-image-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\/_next\/image\?url=.+$/i,
            new e.StaleWhileRevalidate({
                cacheName: "next-image",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:mp3|wav|ogg)$/i,
            new e.CacheFirst({
                cacheName: "static-audio-assets",
                plugins: [
                    new e.RangeRequestsPlugin(),
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:mp4)$/i,
            new e.CacheFirst({
                cacheName: "static-video-assets",
                plugins: [
                    new e.RangeRequestsPlugin(),
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:js)$/i,
            new e.StaleWhileRevalidate({
                cacheName: "static-js-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:css|less)$/i,
            new e.StaleWhileRevalidate({
                cacheName: "static-style-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\/_next\/data\/.+\/.+\.json$/i,
            new e.StaleWhileRevalidate({
                cacheName: "next-data",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:json|xml|csv)$/i,
            new e.NetworkFirst({
                cacheName: "static-data-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            ({ url: e }) => {
                if (!(self.origin === e.origin)) return !1;
                const i = e.pathname;
                return !i.startsWith("/api/auth/") && !!i.startsWith("/api/");
            },
            new e.NetworkFirst({
                cacheName: "apis",
                networkTimeoutSeconds: 10,
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 16,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            ({ url: e }) => {
                if (!(self.origin === e.origin)) return !1;
                return !e.pathname.startsWith("/api/");
            },
            new e.NetworkFirst({
                cacheName: "others",
                networkTimeoutSeconds: 10,
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 86400,
                    }),
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            ({ url: e }) => !(self.origin === e.origin),
            new e.NetworkFirst({
                cacheName: "cross-origin",
                networkTimeoutSeconds: 10,
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 3600,
                    }),
                ],
            }),
            "GET"
        );
});
