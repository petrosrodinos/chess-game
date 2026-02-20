import type { PieceType } from '../../pages/Game/types'
import { PieceTypes } from '../../pages/Game/types'
import pieceMoveSound from '../../assets/audio/piece_move.mp3'
import swordHitSound from '../../assets/audio/sword_hit.mp3'
import bombSound from '../../assets/audio/bomb.mp3'
import horseSound from '../../assets/audio/horse.mp3'
import teleportSound from '../../assets/audio/teleport.mp3'
import mysteryBoxSound from '../../assets/audio/mystery_box.mp3'
import magicSwapSound from '../../assets/audio/magic_swap.mp3'
import resurrectionSound from '../../assets/audio/resurection.mp3'
import monsterAttackSound from '../../assets/audio/monster_attack.mp3'
import rockSound from '../../assets/audio/rock.mp3'
import gameStartSound from '../../assets/audio/game_start.mp3'
import menuClickSound from '../../assets/audio/menu_click.mp3'
import levelUpSound from '../../assets/audio/level-up.mp3'
import stunSound from '../../assets/audio/stun.mp3'

export const SoundEvents = {
  PIECE_MOVE: 'piece_move',
  PIECE_CAPTURE: 'piece_capture',
  PIECE_SELECT: 'piece_select',
  BOMB_EXPLODE: 'bomb_explode',
  CHARIOT_MOVE: 'chariot_move',
  TELEPORT: 'teleport',
  CAVE_TELEPORT: 'cave_teleport',
  MYSTERY_BOX: 'mystery_box',
  SWAP: 'swap',
  REVIVE: 'revive',
  MONSTER_ATTACK: 'monster_attack',
  GAME_START: 'game_start',
  GAME_OVER: 'game_over',
  MENU_CLICK: 'menu_click',
  STUN: 'stun',
} as const

export type SoundEvent = typeof SoundEvents[keyof typeof SoundEvents]

export const SOUND_FILES: Record<SoundEvent, string> = {
  [SoundEvents.PIECE_MOVE]: pieceMoveSound,
  [SoundEvents.PIECE_CAPTURE]: swordHitSound,
  [SoundEvents.PIECE_SELECT]: menuClickSound,
  [SoundEvents.BOMB_EXPLODE]: bombSound,
  [SoundEvents.CHARIOT_MOVE]: horseSound,
  [SoundEvents.TELEPORT]: teleportSound,
  [SoundEvents.CAVE_TELEPORT]: rockSound,
  [SoundEvents.MYSTERY_BOX]: mysteryBoxSound,
  [SoundEvents.SWAP]: magicSwapSound,
  [SoundEvents.REVIVE]: resurrectionSound,
  [SoundEvents.MONSTER_ATTACK]: monsterAttackSound,
  [SoundEvents.GAME_START]: gameStartSound,
  [SoundEvents.GAME_OVER]: levelUpSound,
  [SoundEvents.MENU_CLICK]: menuClickSound,
  [SoundEvents.STUN]: stunSound,
} as const

export const PIECE_MOVE_SOUNDS: Partial<Record<PieceType, SoundEvent>> = {} as const

export const PIECE_CAPTURE_SOUNDS: Partial<Record<PieceType, SoundEvent>> = {
  [PieceTypes.NECROMANCER]: SoundEvents.MONSTER_ATTACK,
} as const

export const DEFAULT_CAPTURE_SOUND: SoundEvent = SoundEvents.PIECE_CAPTURE

export const SOUND_VOLUMES: Partial<Record<SoundEvent, number>> = {
  [SoundEvents.PIECE_SELECT]: 0.3,
  [SoundEvents.MENU_CLICK]: 0.3,
} as const
