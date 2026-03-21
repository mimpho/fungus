import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import App from './App'
import './styles.css'
import 'leaflet/dist/leaflet.css'

// createBrowserRouter (data router) is required for useBlocker to work in
// ImageGenerator — it cannot be used with the legacy BrowserRouter component.
// App.jsx keeps its <Routes>/<Route> tree unchanged; the catch-all path="*"
// lets the inner <Routes> handle all route matching as before.
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <AppProvider>
        <App />
      </AppProvider>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
