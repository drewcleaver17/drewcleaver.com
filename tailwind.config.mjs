// Tailwind CSS v4 — theme is configured via CSS @theme directives in src/styles/global.css.
// This file is kept for documentation and tooling reference.
//
// Design tokens:
//   --color-teal:   #0f6e56  (primary accent)
//   --color-bg:     #faf9f7  (off-white background)
//   --color-ink:    #1a1a1a  (dark text)
//
// See: https://tailwindcss.com/docs/v4-upgrade#removed-tailwind-config-file

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: '#0f6e56',
        bg: '#faf9f7',
        ink: '#1a1a1a',
      },
    },
  },
};
