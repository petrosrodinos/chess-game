import { useEffect, useRef, useCallback } from 'react'
import type { Move } from '../pages/Game/types'
import { SoundManager } from '../lib/soundManager'
import { SoundEvents } from '../config/audio'
import { getMoveSound } from '../utils/sound.utils'
import { useUIStore } from '../store/uiStore'

export const useSoundEffects = (lastMove: Move | null | undefined) => {
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const moveCountRef = useRef(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    SoundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (!initializedRef.current) {
      SoundManager.preloadAll()
      initializedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!lastMove) return

    const currentCount = moveCountRef.current
    moveCountRef.current += 1

    if (currentCount === 0) return

    const soundEvent = getMoveSound(lastMove)
    SoundManager.play(soundEvent)
  }, [lastMove])

  const playBoardClick = useCallback(() => {
    SoundManager.play(SoundEvents.MENU_CLICK)
  }, [])

  const playSwap = useCallback(() => {
    SoundManager.play(SoundEvents.TELEPORT)
  }, [])

  const playMysteryBox = useCallback(() => {
    SoundManager.play(SoundEvents.MYSTERY_BOX)
  }, [])

  const playCaveTeleport = useCallback(() => {
    SoundManager.play(SoundEvents.CAVE_TELEPORT)
  }, [])

  const playRevive = useCallback(() => {
    SoundManager.play(SoundEvents.REVIVE)
  }, [])

  return { playBoardClick, playSwap, playMysteryBox, playCaveTeleport, playRevive }
}
