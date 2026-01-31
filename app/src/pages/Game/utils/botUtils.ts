import type { Board, Position, Move, BotDifficulty, HintMove, BoardSize } from '../types'
import { isPiece, PlayerColors, BotDifficulties } from '../types'
import { PIECE_RULES } from '../constants'
import { getValidMoves, getValidAttacks, makeMove } from './moveUtils'

const evaluateBoard = (board: Board): number => {
  let score = 0
  const rows = board.length
  const cols = board[0].length
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell)) {
        const rules = PIECE_RULES[cell.type]
        const value = cell.isZombie && rules.zombiePoints ? rules.zombiePoints : rules.points
        const centerBonus = getCenterBonus(row, col, rows, cols, cell.type)
        
        if (cell.color === PlayerColors.BLACK) {
          score += value + centerBonus
        } else {
          score -= value + centerBonus
        }
      }
    }
  }
  return score
}

const getCenterBonus = (row: number, col: number, rows: number, cols: number, pieceType: string): number => {
  const centerRow = (rows - 1) / 2
  const centerCol = (cols - 1) / 2
  const rowDist = Math.abs(row - centerRow) / centerRow
  const colDist = Math.abs(col - centerCol) / centerCol
  const distFromCenter = (rowDist + colDist) / 2
  
  const rules = PIECE_RULES[pieceType]
  const bonusMultiplier = rules.points > 100 ? -5 : 10
  return Math.round((1 - distFromCenter) * bonusMultiplier)
}

const getAllMovesAndAttacks = (
  board: Board,
  color: typeof PlayerColors[keyof typeof PlayerColors],
  boardSize: BoardSize
): { from: Position; to: Position; isAttack: boolean }[] => {
  const allActions: { from: Position; to: Position; isAttack: boolean }[] = []
  const rows = board.length
  const cols = board[0].length

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === color) {
        const moves = getValidMoves(board, { row, col }, boardSize)
        for (const to of moves) {
          allActions.push({ from: { row, col }, to, isAttack: false })
        }
        
        const attacks = getValidAttacks(board, { row, col }, boardSize)
        for (const to of attacks) {
          allActions.push({ from: { row, col }, to, isAttack: true })
        }
      }
    }
  }

  return allActions
}

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  boardSize: BoardSize
): number => {
  if (depth === 0) {
    return evaluateBoard(board)
  }

  const color = isMaximizing ? PlayerColors.BLACK : PlayerColors.WHITE
  let bestScore = isMaximizing ? -Infinity : Infinity

  const actions = getAllMovesAndAttacks(board, color, boardSize)
  
  if (actions.length === 0) {
    return evaluateBoard(board)
  }

  for (const action of actions) {
    const { newBoard } = makeMove(board, action.from, action.to, boardSize, action.isAttack)
    const score = minimax(newBoard, depth - 1, alpha, beta, !isMaximizing, boardSize)

    if (isMaximizing) {
      bestScore = Math.max(bestScore, score)
      alpha = Math.max(alpha, score)
    } else {
      bestScore = Math.min(bestScore, score)
      beta = Math.min(beta, score)
    }

    if (beta <= alpha) break
  }

  return bestScore
}

const evaluateMoveSimple = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize,
  isAttack: boolean
): number => {
  const { move } = makeMove(board, from, to, boardSize, isAttack)
  let score = Math.random() * 10

  if (move.captured) {
    const capturedRules = PIECE_RULES[move.captured.type]
    score += capturedRules.points * 2
  }

  if (isAttack) {
    score += 20
  }

  return score
}

const evaluateMoveMedium = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize,
  isAttack: boolean
): number => {
  const { newBoard, move } = makeMove(board, from, to, boardSize, isAttack)
  let score = 0

  if (move.captured) {
    const capturedRules = PIECE_RULES[move.captured.type]
    score += capturedRules.points * 10
  }

  const rows = board.length
  const cols = board[0].length
  const cell = board[from.row][from.col]
  if (cell && isPiece(cell)) {
    const fromBonus = getCenterBonus(from.row, from.col, rows, cols, cell.type)
    const toBonus = getCenterBonus(to.row, to.col, rows, cols, cell.type)
    score += toBonus - fromBonus
  }

  score += evaluateBoard(newBoard) * 0.1

  return score
}

const evaluateMoveHard = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize,
  isAttack: boolean
): number => {
  const { newBoard, move } = makeMove(board, from, to, boardSize, isAttack)
  
  let score = minimax(newBoard, 2, -Infinity, Infinity, false, boardSize)

  if (move.captured) {
    const capturedRules = PIECE_RULES[move.captured.type]
    score += capturedRules.points * 0.1
  }

  return score
}

export const getBotMove = (
  board: Board,
  _lastMove: Move | null,
  difficulty: BotDifficulty,
  boardSize: BoardSize
): HintMove | null => {
  const allActions = getAllMovesAndAttacks(board, PlayerColors.BLACK, boardSize)

  if (allActions.length === 0) {
    return null
  }

  const scoredActions = allActions.map(action => {
    let score: number
    switch (difficulty) {
      case BotDifficulties.EASY:
        score = evaluateMoveSimple(board, action.from, action.to, boardSize, action.isAttack)
        break
      case BotDifficulties.MEDIUM:
        score = evaluateMoveMedium(board, action.from, action.to, boardSize, action.isAttack)
        break
      case BotDifficulties.HARD:
        score = evaluateMoveHard(board, action.from, action.to, boardSize, action.isAttack)
        break
    }
    return { ...action, score }
  })

  scoredActions.sort((a, b) => b.score - a.score)

  let selectedIndex = 0
  if (difficulty === BotDifficulties.EASY) {
    const range = Math.min(5, scoredActions.length)
    selectedIndex = Math.floor(Math.random() * range)
  } else if (difficulty === BotDifficulties.MEDIUM) {
    const range = Math.min(3, scoredActions.length)
    selectedIndex = Math.floor(Math.random() * range)
  }

  const selected = scoredActions[selectedIndex]
  return { from: selected.from, to: selected.to, isAttack: selected.isAttack }
}

export const getHintMove = (board: Board, _lastMove: Move | null, boardSize: BoardSize): HintMove | null => {
  const allActions = getAllMovesAndAttacks(board, PlayerColors.WHITE, boardSize)

  if (allActions.length === 0) {
    return null
  }

  const scoredActions = allActions.map(action => {
    const { newBoard, move } = makeMove(board, action.from, action.to, boardSize, action.isAttack)
    
    let score = -evaluateBoard(newBoard)
    
    if (move.captured) {
      const capturedRules = PIECE_RULES[move.captured.type]
      score += capturedRules.points * 10
    }
    
    const rows = board.length
    const cols = board[0].length
    const cell = board[action.from.row][action.from.col]
    if (cell && isPiece(cell)) {
      const fromBonus = getCenterBonus(action.from.row, action.from.col, rows, cols, cell.type)
      const toBonus = getCenterBonus(action.to.row, action.to.col, rows, cols, cell.type)
      score += toBonus - fromBonus
    }

    return { ...action, score }
  })

  scoredActions.sort((a, b) => b.score - a.score)
  return { from: scoredActions[0].from, to: scoredActions[0].to, isAttack: scoredActions[0].isAttack }
}
