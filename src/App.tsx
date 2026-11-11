import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/ui/toast'
import { useThemeStore } from './store/useThemeStore'
import { useEffect } from 'react'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000, // 30 seconds
    },
    mutations: {
      retry: 0,
    },
  },
})

function App() {
  const { setTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem('theme-storage')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.theme) {
          setTheme(parsed.theme)
        }
      } catch {
        setTheme('light')
      }
    } else {
      setTheme('light')
    }
  }, [setTheme])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
