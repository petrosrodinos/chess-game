import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface AuthGuardProps {
    children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
    const userId = useAuthStore(state => state.userId)

    if (!userId) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
