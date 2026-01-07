/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#0f172a',
                'brand-darker': '#020617',
                'brand-primary': '#3b82f6',
                'brand-accent': '#6366f1',
                'brand-success': '#10b981',
                'brand-warning': '#f59e0b',
                'brand-danger': '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
