import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Login, Home } from './pages'
import { AuthGuard } from './components/AuthGuard'
import { useAuthStore } from './store/authStore'

const RootRedirect = () => {
    const userId = useAuthStore(state => state.userId)
    return <Navigate to={userId ? '/home' : '/login'} replace />
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/home"
                    element={
                        <AuthGuard>
                            <Home />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/game"
                    element={
                        <AuthGuard>
                            <App />
                        </AuthGuard>
                    }
                />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
