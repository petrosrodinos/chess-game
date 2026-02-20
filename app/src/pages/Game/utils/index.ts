export {
  createInitialBoard,
  cloneBoard,
  isInBounds,
  isSquareBlockedByObstacle,
  getCellContent,
  findPiecePositions,
  findAllCaves,
  movePiece,
  attackPiece
} from './boardUtils'
export {
  getPieceMoves,
  getValidMoves,
  getValidAttacks,
  makeMove,
  hasLegalMoves,
  findMonarch,
  isMonarchCaptured,
  isValidMove,
  canAttack
} from './moveUtils'
export { getBotMove, getHintMove } from './botUtils'
export {
  getNarcPositions,
  createNarcsForBomber,
  findNarcAtPosition,
  removeNarcsForBomber,
  checkNarcTrigger,
  checkNarcNetTrigger,
  getAllNarcNetPositions
} from './narcUtils'
export type { NarcNetPosition } from './narcUtils'
export {
  isValidSwap,
  getValidSwapTargets,
  executeSwap,
  canInitiateSwap
} from './swapUtils'
export type { SwapResult, SwapTarget } from './swapUtils'
export {
  isZombieEligibleType,
  filterZombieRevivablePieces,
  getNightModeFromBoard,
  getAdjustedAttackRange,
  areRevivalGuardsInPlace,
  findPiecePosition,
  reviveZombiePiece,
  getStartingPositionForPieceType,
  getZombieRevivePieces,
  isZombieReviveTargetEmpty,
  getZombieRevivePlacementTarget,
  getZombieReviveOpenState,
  getZombieReviveConfirmState,
  getZombieReviveStatusMessage
} from './zombieUtils'

export {
  getInitialMysteryBoxState,
  rollDice,
  getRandomMysteryBoxOption,
  isMysteryBoxTile,
  getPlayerFigures,
  getPlayerHoplites,
  getEmptyTiles,
  getAllObstacles,
  isSelectableObstacle,
  executeFigureSwap,
  executeHopliteSacrifice,
  executeRevivePiece,
  executeObstacleSwap,
  canPlayerUseMysteryBoxOption1,
  canPlayerUseMysteryBoxOption2,
  canPlayerUseMysteryBoxOption3,
  getRevivablePieces,
  getPhaseForOption,
  getMysteryBoxOptionName,
  removeMysteryBoxFromBoard,
  isPositionInList,
  isObstacleSwapPlacementAllowed
} from './mysteryBoxUtils'