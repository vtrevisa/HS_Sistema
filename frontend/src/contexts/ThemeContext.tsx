import React, { createContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
 theme: Theme
 setTheme: (theme: Theme) => void
 actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
 children
}) => {
 const [theme, setTheme] = useState<Theme>(() => {
  const stored = localStorage.getItem('theme') as Theme
  return stored || 'system'
 })

 const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

 useEffect(() => {
  const root = window.document.documentElement

  const getSystemTheme = () => {
   return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
  }

  const updateTheme = () => {
   const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
   setActualTheme(resolvedTheme)

   root.classList.remove('light', 'dark')
   root.classList.add(resolvedTheme)
  }

  updateTheme()

  if (theme === 'system') {
   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
   mediaQuery.addEventListener('change', updateTheme)
   return () => mediaQuery.removeEventListener('change', updateTheme)
  }
 }, [theme])

 useEffect(() => {
  localStorage.setItem('theme', theme)
 }, [theme])

 return (
  <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
   {children}
  </ThemeContext.Provider>
 )
}

export default ThemeContext
