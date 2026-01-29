import type { Board, Position, Move, BotDifficulty, HintMove } from '../types'
import { PIECE_VALUES, POSITION_BONUS } from '../constants'
import { getValidMoves, makeMove, isInCheck } from './moveUtils'

const evaluateBoard = (board: Board): number => {
  let score = 0
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece) {
        const value = PIECE_VALUES[piece.type]
        const bonus = piece.color === 'black'
          ? POSITION_BONUS[piece.type][row][col]
          : POSITION_BONUS[piece.type][7 - row][col]
        if (piece.color === 'black') {
          score += value + bonus
        } else {
          score -= value + bonus
        }
      }
    }
  }
  return score
}

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  lastMove: Move | null
): number => {
  if (depth === 0) {
    return evaluateBoard(board)
  }

  const color = isMaximizing ? 'black' : 'white'
  let bestScore = isMaximizing ? -Infinity : Infinity

  outer: for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, lastMove)
        for (const move of moves) {
          const { newBoard, move: newMove } = makeMove(board, { row, col }, move, lastMove)
          const score = minimax(newBoard, depth - 1, alpha, beta, !isMaximizing, newMove)

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

const evaluateMoveSimple = (board: Board, from: Position, to: Position, lastMove: Move | null): number => {
  const { newBoard, move } = makeMove(board, from, to, lastMove)
  let score = Math.random() * 10

  if (move.captured) {
    score += PIECE_VALUES[move.captured.type]
  }

  if (isInCheck(newBoard, 'white')) {
    score += 30
  }

  return score
}

const evaluateMoveMedium = (board: Board, from: Position, to: Position, lastMove: Move | null): number => {
  const { newBoard, move } = makeMove(board, from, to, lastMove)
  let score = 0

  if (move.captured) {
    score += PIECE_VALUES[move.captured.type] * 10
  }

  if (isInCheck(newBoard, 'white')) {
    score += 50
  }

  const piece = board[from.row][from.col]
  if (piece) {
    const fromBonus = POSITION_BONUS[piece.type][from.row][from.col]
    const toBonus = POSITION_BONUS[piece.type][to.row][to.col]
    score += toBonus - fromBonus
  }

  score += evaluateBoard(newBoard) * 0.1

  return score
}

const evaluateMoveHard = (board: Board, from: Position, to: Position, lastMove: Move | null): number => {
  const { newBoard, move: newMove } = makeMove(board, from, to, lastMove)
  
  let score = minimax(newBoard, 2, -Infinity, Infinity, false, newMove)

  if (isInCheck(newBoard, 'white')) {
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
  difficulty: BotDifficulty
): HintMove | null => {
  const allMoves: { from: Position; to: Position; score: number }[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === 'black') {
        const moves = getValidMoves(board, { row, col }, lastMove)
        for (const to of moves) {
          let score: number
          switch (difficulty) {
            case 'easy':
              score = evaluateMoveSimple(board, { row, col }, to, lastMove)
              break
            case 'medium':
              score = evaluateMoveMedium(board, { row, col }, to, lastMove)
              break
            case 'hard':
              score = evaluateMoveHard(board, { row, col }, to, lastMove)
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
  if (difficulty === 'easy') {
    const range = Math.min(5, allMoves.length)
    selectedIndex = Math.floor(Math.random() * range)
  } else if (difficulty === 'medium') {
    const range = Math.min(3, allMoves.length)
    selectedIndex = Math.floor(Math.random() * range)
  }

  const selected = allMoves[selectedIndex]
  return { from: selected.from, to: selected.to }
}

export const getHintMove = (board: Board, lastMove: Move | null): HintMove | null => {
  const allMoves: { from: Position; to: Position; score: number }[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === 'white') {
        const moves = getValidMoves(board, { row, col }, lastMove)
        for (const to of moves) {
          const { newBoard, move } = makeMove(board, { row, col }, to, lastMove)
          
          let score = -evaluateBoard(newBoard)
          
          if (move.captured) {
            score += PIECE_VALUES[move.captured.type] * 10
          }
          
          if (isInCheck(newBoard, 'black')) {
            score += 50
          }
          
          const fromBonus = POSITION_BONUS[piece.type][7 - row][col]
          const toBonus = POSITION_BONUS[piece.type][7 - to.row][to.col]
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
