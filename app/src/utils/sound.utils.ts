import type { Move } from '../pages/Game/types'
import type { PieceType } from '../pages/Game/types'
import type { SoundEvent } from '../config/audio'
import { SoundEvents, PIECE_CAPTURE_SOUNDS, DEFAULT_CAPTURE_SOUND } from '../config/audio'

export const getMoveSound = (move: Move): SoundEvent => {
  if (move.terminatedByNarc) return SoundEvents.BOMB_EXPLODE

  if (move.captured) {
    const pieceType = move.piece.type as PieceType
    const captureSound = PIECE_CAPTURE_SOUNDS[pieceType]
    if (captureSound) return captureSound
    return DEFAULT_CAPTURE_SOUND
  }

  return SoundEvents.PIECE_MOVE
}

const VALID_SOUND_EVENTS = new Set<string>(Object.values(SoundEvents))

export const isValidSoundEvent = (key: unknown): key is SoundEvent =>
  typeof key === 'string' && VALID_SOUND_EVENTS.has(key)
