/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1E77FC",
                "color-base": "#ffffff11",
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
