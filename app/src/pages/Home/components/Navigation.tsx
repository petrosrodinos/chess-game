import { useState, useCallback } from 'react'
import { Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { environments } from '../../../config/environments'
import { SettingsModal } from './SettingsModal'
import { ConfirmationDialog } from './ConfirmationDialog'

export const Navigation = () => {
    const navigate = useNavigate()
    const username = useAuthStore(state => state.username)
    const userId = useAuthStore(state => state.userId)
    const logout = useAuthStore(state => state.logout)
    const [showSettings, setShowSettings] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const handleLogoutClick = useCallback(() => {
        setShowLogoutConfirm(true)
    }, [])

    const handleLogoutConfirm = useCallback(() => {
        logout()
        navigate('/login')
    }, [logout, navigate])

    return (
        <>
            <nav className="bg-stone-800/60 backdrop-blur-sm border-b border-stone-700/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                            {environments.APP_NAME}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowSettings(true)}
                                className="p-2.5 bg-stone-700/60 hover:bg-stone-600/60 rounded-lg transition-all duration-200 border border-stone-600/50"
                            >
                                <Settings className="w-5 h-5 text-amber-400" />
                            </button>
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="p-2.5 bg-stone-700/60 hover:bg-stone-600/60 rounded-lg transition-all duration-200 border border-stone-600/50"
                            >
                                <LogOut className="w-5 h-5 text-stone-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <SettingsModal 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                username={username}
                userId={userId}
            />

            <ConfirmationDialog 
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to sign out? Any ongoing games will be lost."
                confirmText="Sign Out"
                cancelText="Cancel"
            />
        </>
    )
}
