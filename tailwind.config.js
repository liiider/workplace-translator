/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#0d7ff2",
                "background-light": "#f5f7f8",
                "background-dark": "#09090b",
                "surface-dark": "#18181b",
                "accent-amber": "#f59e0b",
                "terminal-green": "#22c55e",
                "zinc-950": "#09090b",
                "zinc-900": "#18181b",
                "zinc-800": "#27272a",
            },
            fontFamily: {
                "display": ["Outfit", "Inter", "sans-serif"],
                "tech": ["Space Grotesk", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"],
                "serif": ["Noto Serif SC", "serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "full": "9999px"
            },
            keyframes: {
                shimmer: {
                    '0%': { left: '-100%' },
                    '100%': { left: '200%' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
