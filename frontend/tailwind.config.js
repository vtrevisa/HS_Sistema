/** @type {import('tailwindcss').Config} */
export default {
 darkMode: ['class'],
 content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './src/**/*.{js,ts,jsx,tsx}',
  './app/**/*.{js,ts,jsx,tsx}'
 ],
 theme: {
  container: {
   center: true,
   padding: '2rem',
   screens: {
    '2xl': '1400px'
   }
  },
  extend: {
   screens: {
    1150: '1150px',
    'xl-max': { min: '1280px', max: '1600px' },
    'xl-max2': { min: '1150px', max: '1600px' },
    'sm-max': { max: '910px' },
    'md-min': '910px'
   },
   backgroundImage: {
    login: "url('/background.jpg')"
   },
   colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    'red-1000': 'var(--border-red-1000)',
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
      height: '0'
     },
     to: {
      height: 'var(--radix-accordion-content-height)'
     }
    },
    'accordion-up': {
     from: {
      height: 'var(--radix-accordion-content-height)'
     },
     to: {
      height: '0'
     }
    },
    'fade-down': {
     '0%': { opacity: '0', transform: 'translateY(-100px)' },
     '100%': { opacity: '1', transform: 'translateY(0)' }
    }
   },
   animation: {
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
    'fade-down': 'fade-down 0.6s ease-out both'
   }
  }
 },
 plugins: [require('tailwindcss-animate')]
}
