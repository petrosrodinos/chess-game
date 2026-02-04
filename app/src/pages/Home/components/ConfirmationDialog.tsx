import { X } from 'lucide-react'

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmationDialogProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-stone-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-amber-400">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>
                <p className="text-stone-300 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
