import { X } from 'lucide-react'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    username: string | null
    userId: string | null
}

export const SettingsModal = ({ isOpen, onClose, username, userId }: SettingsModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-stone-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-amber-400">Settings</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30">
                        <h4 className="text-stone-200 font-medium mb-2">Account</h4>
                        <p className="text-stone-400 text-sm mb-1">Username: <span className="text-amber-400">{username}</span></p>
                        <p className="text-stone-400 text-sm">User ID: <span className="text-stone-500 text-xs">{userId?.slice(0, 8)}...</span></p>
                    </div>
                    <div className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30">
                        <h4 className="text-stone-200 font-medium mb-2">Preferences</h4>
                        <p className="text-stone-500 text-sm">Settings coming soon...</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
