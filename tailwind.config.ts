
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                brand: {
                    yellow: "#FFEB3B", // Banana yellow color
                    dark: "#121212",   // Dark shade for backgrounds
                    light: "#FFFFFF",  // Light shade for text on dark backgrounds
                    highlight: "#FFD54F", // Lighter yellow for highlights
                    muted: "#FFFDE7"   // Very light yellow for subtle backgrounds
                },
                premium: {
                    dark: "#141428",      // Dark purple-blue for backgrounds
                    darker: "#0E0E1C",    // Even darker shade for contrast
                    card: "#1A1A2E",      // Slightly lighter shade for cards
                    highlight: "#2D2D44", // Highlight color for hover states
                    border: "#252538",    // Border color
                    accent1: "#614FE0",   // Purple accent
                    accent2: "#7166F9",   // Lighter purple accent
                    accent3: "#30A8C5",   // Teal accent
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' }
                },
                'slide-up': {
                    from: { 
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    to: { 
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'slide-in': {
                    from: { 
                        opacity: '0',
                        transform: 'translateX(-10px)'
                    },
                    to: { 
                        opacity: '1',
                        transform: 'translateX(0)'
                    }
                },
                'scale-in': {
                    from: { 
                        opacity: '0',
                        transform: 'scale(0.95)'
                    },
                    to: { 
                        opacity: '1',
                        transform: 'scale(1)'
                    }
                },
                'bounce-in': {
                    '0%': {
                        transform: 'scale(0.8)',
                        opacity: '0'
                    },
                    '50%': {
                        transform: 'scale(1.05)'
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1'
                    }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.6s ease-out',
                'slide-up': 'slide-up 0.6s ease-out',
                'slide-in': 'slide-in 0.6s ease-out',
                'scale-in': 'scale-in 0.4s ease-out',
                'bounce-in': 'bounce-in 0.5s ease-out'
			},
            transitionDuration: {
                '400': '400ms',
                '600': '600ms',
                '800': '800ms',
            },
            backgroundImage: {
                'gradient-premium': 'linear-gradient(to bottom, rgba(26, 26, 46, 0.7), rgba(14, 14, 28, 0.9))',
                'gradient-card': 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(38, 38, 66, 0.8) 100%)',
                'gradient-highlight': 'linear-gradient(135deg, #614FE0 0%, #7166F9 100%)',
                'gradient-sidebar': 'linear-gradient(180deg, rgba(20, 20, 40, 1) 0%, rgba(14, 14, 28, 1) 100%)',
                'gradient-accent': 'linear-gradient(135deg, #30A8C5 0%, #614FE0 100%)',
                'gradient-premium-yellow': 'linear-gradient(135deg, #FFEB3B 0%, #FFD54F 100%)',
            },
            boxShadow: {
                'premium-sm': '0 2px 8px rgba(0, 0, 0, 0.25)',
                'premium-md': '0 4px 12px rgba(0, 0, 0, 0.3)',
                'premium-lg': '0 8px 20px rgba(0, 0, 0, 0.35)',
                'premium-highlight': '0 0 15px rgba(97, 79, 224, 0.4)',
                'premium-glow': '0 0 25px rgba(113, 102, 249, 0.25)',
                'premium-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
                'premium-yellow': '0 2px 8px rgba(255, 235, 59, 0.3)',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
