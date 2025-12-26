/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            /* ===== Typography ===== */
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                heading: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.5' }],
                sm: ['0.875rem', { lineHeight: '1.5' }],
                base: ['0.9375rem', { lineHeight: '1.6' }],    // 15px
                lg: ['1.125rem', { lineHeight: '1.6' }],
                xl: ['1.25rem', { lineHeight: '1.4' }],
                '2xl': ['1.5rem', { lineHeight: '1.3' }],
                '3xl': ['1.875rem', { lineHeight: '1.2' }],
                '4xl': ['2.25rem', { lineHeight: '1.1' }],
                '5xl': ['3rem', { lineHeight: '1' }],
            },

            /* ===== Colors (Semantic Tokens) ===== */
            colors: {
                /* Base */
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',

                /* Surfaces */
                surface: {
                    DEFAULT: 'hsl(var(--surface))',
                    hover: 'hsl(var(--surface-hover))',
                },
                overlay: 'hsl(var(--overlay))',

                /* Text */
                'foreground-muted': 'hsl(var(--foreground-muted))',
                'foreground-subtle': 'hsl(var(--foreground-subtle))',

                /* Brand */
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    hover: 'hsl(var(--primary-hover))',
                },

                /* Accents */
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },

                /* Semantic */
                success: 'hsl(var(--success))',
                warning: 'hsl(var(--warning))',
                danger: 'hsl(var(--danger))',
                info: 'hsl(var(--info))',

                /* Borders */
                border: {
                    DEFAULT: 'hsl(var(--border))',
                    hover: 'hsl(var(--border-hover))',
                    strong: 'hsl(var(--border-strong))',
                },

                /* States */
                ring: 'hsl(var(--ring))',
                selection: 'hsl(var(--selection))',

                /* Legacy compatibility (can be removed later) */
                input: 'hsl(var(--border))',
                muted: {
                    DEFAULT: 'hsl(var(--surface))',
                    foreground: 'hsl(var(--foreground-muted))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--overlay))',
                    foreground: 'hsl(var(--foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--surface))',
                    foreground: 'hsl(var(--foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--surface))',
                    foreground: 'hsl(var(--foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--danger))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
            },

            /* ===== Border Radius ===== */
            borderRadius: {
                sm: 'var(--radius-sm)',
                DEFAULT: 'var(--radius)',
                md: 'var(--radius)',
                lg: 'var(--radius-lg)',
                xl: '1.5rem',
                '2xl': '2rem',
                full: 'var(--radius-full)',
            },

            /* ===== Spacing (using consistent 4px scale) ===== */
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            /* ===== Box Shadow ===== */
            boxShadow: {
                'smooth-sm': 'var(--shadow-sm)',
                'smooth': 'var(--shadow)',
                'smooth-md': 'var(--shadow-md)',
                'smooth-lg': 'var(--shadow-lg)',
                'smooth-xl': 'var(--shadow-xl)',
                'smooth-2xl': '0 25px 50px -12px hsl(var(--shadow-color) / 0.25)',
                'glow': '0 0 20px hsl(var(--primary) / 0.3)',
                'glow-lg': '0 0 40px hsl(var(--primary) / 0.4)',
            },

            /* ===== Animations ===== */
            keyframes: {
                // Accordion
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },

                // Fade animations
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' }
                },

                // Slide animations
                'slide-in-from-top': {
                    '0%': { transform: 'translateY(-8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'slide-in-from-bottom': {
                    '0%': { transform: 'translateY(8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'slide-in-from-left': {
                    '0%': { transform: 'translateX(-8px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                'slide-in-from-right': {
                    '0%': { transform: 'translateX(8px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },

                // Scale animations
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'scale-out': {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(0.95)', opacity: '0' }
                },

                // Pulse
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' }
                },

                // Spin
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                },

                // Shimmer
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                }
            },
            animation: {
                // Radix UI
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',

                // Fade
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-out': 'fade-out 0.15s ease-in',

                // Slide
                'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
                'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
                'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
                'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',

                // Scale
                'scale-in': 'scale-in 0.2s ease-out',
                'scale-out': 'scale-out 0.15s ease-in',

                // Pulse
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',

                // Spin
                'spin-slow': 'spin-slow 3s linear infinite',

                // Shimmer
                'shimmer': 'shimmer 2s linear infinite',
            },

            /* ===== Transitions ===== */
            transitionDuration: {
                '0': '0ms',
                '75': '75ms',
                '100': '100ms',
                '150': '150ms',
                '200': '200ms',
                '300': '300ms',
                '400': '400ms',
                '500': '500ms',
                '700': '700ms',
                '1000': '1000ms',
            },
            transitionTimingFunction: {
                'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'ease-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },

            /* ===== Z-Index Scale ===== */
            zIndex: {
                '1': '1',
                '2': '2',
                '3': '3',
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            },

            /* ===== Backdrop Blur ===== */
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
};
