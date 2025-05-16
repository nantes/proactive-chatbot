import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Chat } from './components/Chat'

const queryClient = new QueryClient()
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
])

function App() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        {error ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ffcdd2',
            borderRadius: '4px',
            maxWidth: '600px',
            margin: '20px auto',
            textAlign: 'center'
          }}>
            <h2>Error en la aplicación:</h2>
            <p>{error}</p>
          </div>
        ) : (
          <Chat />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
