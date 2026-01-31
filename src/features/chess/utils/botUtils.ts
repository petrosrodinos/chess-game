import type { Board, Position, Move, BotDifficulty, HintMove, BoardSize } from '../types'
import { isPiece, PieceColors, PieceTypes, BotDifficulties } from '../types'
import { PIECE_VALUES } from '../constants'
import { getValidMoves, makeMove, isInCheck } from './moveUtils'

const evaluateBoard = (board: Board): number => {
  let score = 0
  const rows = board.length
  const cols = board[0].length
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell)) {
        const value = PIECE_VALUES[cell.type]
        const centerBonus = getCenterBonus(row, col, rows, cols, cell.type)
        if (cell.color === PieceColors.BLACK) {
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
  
  const bonusMultiplier = pieceType === PieceTypes.KING ? -10 : 20
  return Math.round((1 - distFromCenter) * bonusMultiplier)
}

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  lastMove: Move | null,
  boardSize: BoardSize
): number => {
  if (depth === 0) {
    return evaluateBoard(board)
  }

  const color = isMaximizing ? PieceColors.BLACK : PieceColors.WHITE
  let bestScore = isMaximizing ? -Infinity : Infinity
  const rows = board.length
  const cols = board[0].length

  outer: for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === color) {
        const moves = getValidMoves(board, { row, col }, lastMove, boardSize)
        for (const move of moves) {
          const { newBoard, move: newMove } = makeMove(board, { row, col }, move, lastMove, boardSize)
          const score = minimax(newBoard, depth - 1, alpha, beta, !isMaximizing, newMove, boardSize)

          if (isMaximizing) {
            bestScore = Math.max(bestScore, score)
            alpha = Math.max(alpha, score)
          } else {
            bestScore = Math.min(bestScore, score)
            beta = Math.min(beta, score)
          }

          if (beta <= alpha) break outer
        }
      }
    }
  }

  return bestScore === -Infinity || bestScore === Infinity ? evaluateBoard(board) : bestScore
}

const evaluateMoveSimple = (board: Board, from: Position, to: Position, lastMove: Move | null, boardSize: BoardSize): number => {
  const { newBoard, move } = makeMove(board, from, to, lastMove, boardSize)
  let score = Math.random() * 10

  if (move.captured) {
    score += PIECE_VALUES[move.captured.type]
  }

  if (isInCheck(newBoard, PieceColors.WHITE, boardSize)) {
    score += 30
  }

  return score
}

const evaluateMoveMedium = (board: Board, from: Position, to: Position, lastMove: Move | null, boardSize: BoardSize): number => {
  const { newBoard, move } = makeMove(board, from, to, lastMove, boardSize)
  let score = 0

  if (move.captured) {
    score += PIECE_VALUES[move.captured.type] * 10
  }

  if (isInCheck(newBoard, PieceColors.WHITE, boardSize)) {
    score += 50
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

const evaluateMoveHard = (board: Board, from: Position, to: Position, lastMove: Move | null, boardSize: BoardSize): number => {
  const { newBoard, move: newMove } = makeMove(board, from, to, lastMove, boardSize)
  
  let score = minimax(newBoard, 2, -Infinity, Infinity, false, newMove, boardSize)

  if (isInCheck(newBoard, PieceColors.WHITE, boardSize)) {
    score += 50
  }

  if (newMove.captured) {
    score += PIECE_VALUES[newMove.captured.type] * 0.1
  }

  return score
}

export const getBotMove = (
  board: Board,
  lastMove: Move | null,
  difficulty: BotDifficulty,
  boardSize: BoardSize
): HintMove | null => {
  const allMoves: { from: Position; to: Position; score: number }[] = []
  const rows = board.length
  const cols = board[0].length

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === PieceColors.BLACK) {
        const moves = getValidMoves(board, { row, col }, lastMove, boardSize)
        for (const to of moves) {
          let score: number
          switch (difficulty) {
            case BotDifficulties.EASY:
              score = evaluateMoveSimple(board, { row, col }, to, lastMove, boardSize)
              break
            case BotDifficulties.MEDIUM:
              score = evaluateMoveMedium(board, { row, col }, to, lastMove, boardSize)
              break
            case BotDifficulties.HARD:
              score = evaluateMoveHard(board, { row, col }, to, lastMove, boardSize)
              break
          }
          allMoves.push({ from: { row, col }, to, score })
        }
      }
    }
  }

  if (allMoves.length === 0) {
    return null
  }

  allMoves.sort((a, b) => b.score - a.score)

  let selectedIndex = 0
  if (difficulty === BotDifficulties.EASY) {
    const range = Math.min(5, allMoves.length)
    selectedIndex = Math.floor(Math.random() * range)
  } else if (difficulty === BotDifficulties.MEDIUM) {
    const range = Math.min(3, allMoves.length)
    selectedIndex = Math.floor(Math.random() * range)
  }

  const selected = allMoves[selectedIndex]
  return { from: selected.from, to: selected.to }
}

export const getHintMove = (board: Board, lastMove: Move | null, boardSize: BoardSize): HintMove | null => {
  const allMoves: { from: Position; to: Position; score: number }[] = []
  const rows = board.length
  const cols = board[0].length

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === PieceColors.WHITE) {
        const moves = getValidMoves(board, { row, col }, lastMove, boardSize)
        for (const to of moves) {
          const { newBoard, move } = makeMove(board, { row, col }, to, lastMove, boardSize)
          
          let score = -evaluateBoard(newBoard)
          
          if (move.captured) {
            score += PIECE_VALUES[move.captured.type] * 10
          }
          
          if (isInCheck(newBoard, PieceColors.BLACK, boardSize)) {
            score += 50
          }
          
          const fromBonus = getCenterBonus(row, col, rows, cols, cell.type)
          const toBonus = getCenterBonus(to.row, to.col, rows, cols, cell.type)
          score += toBonus - fromBonus

          allMoves.push({ from: { row, col }, to, score })
        }
      }
    }
  }

  if (allMoves.length === 0) {
    return null
  }

  allMoves.sort((a, b) => b.score - a.score)
  return { from: allMoves[0].from, to: allMoves[0].to }
}
