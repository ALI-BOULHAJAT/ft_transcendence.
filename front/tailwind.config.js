/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            fontFamily: {
                lato : 'var(--font-lato)',
            },
            colors: {
                primary: '#161F1E',
                secondary: '#1EF0AE',
                tertiary: '#D9D9D9',
                danger: '#F1453E',
                btn: '#161F1E',
                isban: '#F03F19',
                IsActive: '#ED6C03',
            },
        },
    },
    plugins: [],
};
