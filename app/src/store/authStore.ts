import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    userId: string | null
    username: string | null
    setUser: (username: string) => void
    logout: () => void
}

const generateUUID = (): string => {
    return crypto.randomUUID()
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userId: null,
            username: null,
            setUser: (username: string) => set({
                userId: generateUUID(),
                username
            }),
            logout: () => set({
                userId: null,
                username: null
            })
        }),
        {
            name: 'auth-storage'
        }
    )
)
