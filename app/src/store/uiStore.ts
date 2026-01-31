import { create } from 'zustand'

interface UIStore {
    is3D: boolean
    isTopMenuOpen: boolean
    isRightMenuOpen: boolean
    helpEnabled: boolean
    devMode: boolean

    toggle3D: () => void
    toggleHelp: () => void
    toggleDevMode: () => void
    openTopMenu: () => void
    closeTopMenu: () => void
    openRightMenu: () => void
    closeRightMenu: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    is3D: true,
    isTopMenuOpen: false,
    isRightMenuOpen: false,
    helpEnabled: true,
    devMode: false,

    toggle3D: () => set((state) => ({ is3D: !state.is3D })),
    toggleHelp: () => set((state) => ({ helpEnabled: !state.helpEnabled })),
    toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
    openTopMenu: () => set({ isTopMenuOpen: true }),
    closeTopMenu: () => set({ isTopMenuOpen: false }),
    openRightMenu: () => set({ isRightMenuOpen: true }),
    closeRightMenu: () => set({ isRightMenuOpen: false })
}))
