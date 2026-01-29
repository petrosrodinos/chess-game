import type { Board, Piece, Position, Move, PieceColor, PieceType } from '../types'
import { isInBounds, cloneBoard } from './boardUtils'

const getPawnMoves = (board: Board, pos: Position, piece: Piece, lastMove: Move | null): Position[] => {
  const moves: Position[] = []
  const direction = piece.color === 'white' ? -1 : 1
  const startRow = piece.color === 'white' ? 6 : 1
  
  if (isInBounds(pos.row + direction, pos.col) && !board[pos.row + direction][pos.col]) {
    moves.push({ row: pos.row + direction, col: pos.col })
    
    if (pos.row === startRow && !board[pos.row + 2 * direction][pos.col]) {
      moves.push({ row: pos.row + 2 * direction, col: pos.col })
    }
  }
  
  for (const colOffset of [-1, 1]) {
    const newCol = pos.col + colOffset
    const newRow = pos.row + direction
    if (isInBounds(newRow, newCol)) {
      const target = board[newRow][newCol]
      if (target && target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  if (lastMove && lastMove.piece.type === 'pawn') {
    const movedTwoSquares = Math.abs(lastMove.from.row - lastMove.to.row) === 2
    if (movedTwoSquares && lastMove.to.row === pos.row) {
      if (Math.abs(lastMove.to.col - pos.col) === 1) {
        moves.push({ row: pos.row + direction, col: lastMove.to.col })
      }
    }
  }
  
  return moves
}

const getKnightMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  const moves: Position[] = []
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  
  for (const [rowOff, colOff] of offsets) {
    const newRow = pos.row + rowOff
    const newCol = pos.col + colOff
    if (isInBounds(newRow, newCol)) {
      const target = board[newRow][newCol]
      if (!target || target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

const getSlidingMoves = (board: Board, pos: Position, piece: Piece, directions: number[][]): Position[] => {
  const moves: Position[] = []
  
  for (const [rowDir, colDir] of directions) {
    let newRow = pos.row + rowDir
    let newCol = pos.col + colDir
    
    while (isInBounds(newRow, newCol)) {
      const target = board[newRow][newCol]
      if (!target) {
        moves.push({ row: newRow, col: newCol })
      } else {
        if (target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      }
      newRow += rowDir
      newCol += colDir
    }
  }
  
  return moves
}

const getBishopMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  return getSlidingMoves(board, pos, piece, [[-1, -1], [-1, 1], [1, -1], [1, 1]])
}

const getRookMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  return getSlidingMoves(board, pos, piece, [[-1, 0], [1, 0], [0, -1], [0, 1]])
}

const getQueenMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  return [
    ...getBishopMoves(board, pos, piece),
    ...getRookMoves(board, pos, piece)
  ]
}

const getKingMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  const moves: Position[] = []
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]
  
  for (const [rowOff, colOff] of offsets) {
    const newRow = pos.row + rowOff
    const newCol = pos.col + colOff
    if (isInBounds(newRow, newCol)) {
      const target = board[newRow][newCol]
      if (!target || target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

export const findKing = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const isSquareUnderAttack = (board: Board, pos: Position, defendingColor: PieceColor): boolean => {
  const attackingColor = defendingColor === 'white' ? 'black' : 'white'
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === attackingColor) {
        let moves: Position[]
        if (piece.type === 'pawn') {
          const direction = piece.color === 'white' ? -1 : 1
          moves = []
          for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset
            const newRow = row + direction
            if (isInBounds(newRow, newCol)) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        } else if (piece.type === 'king') {
          moves = getKingMoves(board, { row, col }, piece)
        } else {
          moves = getPieceMoves(board, { row, col }, null)
        }
        
        if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
          return true
        }
      }
    }
  }
  return false
}

export const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  return isSquareUnderAttack(board, kingPos, color)
}

const getCastlingMoves = (board: Board, _pos: Position, piece: Piece): Position[] => {
  const moves: Position[] = []
  if (piece.hasMoved) return moves
  
  const row = piece.color === 'white' ? 7 : 0
  
  const kingSideRook = board[row][7]
  if (kingSideRook && kingSideRook.type === 'rook' && !kingSideRook.hasMoved) {
    if (!board[row][5] && !board[row][6]) {
      if (!isSquareUnderAttack(board, { row, col: 4 }, piece.color) &&
          !isSquareUnderAttack(board, { row, col: 5 }, piece.color) &&
          !isSquareUnderAttack(board, { row, col: 6 }, piece.color)) {
        moves.push({ row, col: 6 })
      }
    }
  }
  
  const queenSideRook = board[row][0]
  if (queenSideRook && queenSideRook.type === 'rook' && !queenSideRook.hasMoved) {
    if (!board[row][1] && !board[row][2] && !board[row][3]) {
      if (!isSquareUnderAttack(board, { row, col: 4 }, piece.color) &&
          !isSquareUnderAttack(board, { row, col: 3 }, piece.color) &&
          !isSquareUnderAttack(board, { row, col: 2 }, piece.color)) {
        moves.push({ row, col: 2 })
      }
    }
  }
  
  return moves
}

export const getPieceMoves = (board: Board, pos: Position, lastMove: Move | null): Position[] => {
  const piece = board[pos.row][pos.col]
  if (!piece) return []
  
  let moves: Position[] = []
  
  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, pos, piece, lastMove)
      break
    case 'knight':
      moves = getKnightMoves(board, pos, piece)
      break
    case 'bishop':
      moves = getBishopMoves(board, pos, piece)
      break
    case 'rook':
      moves = getRookMoves(board, pos, piece)
      break
    case 'queen':
      moves = getQueenMoves(board, pos, piece)
      break
    case 'king':
      moves = [...getKingMoves(board, pos, piece), ...getCastlingMoves(board, pos, piece)]
      break
  }
  
  return moves
}

export const getValidMoves = (board: Board, pos: Position, lastMove: Move | null): Position[] => {
  const piece = board[pos.row][pos.col]
  if (!piece) return []
  
  const possibleMoves = getPieceMoves(board, pos, lastMove)
  const validMoves: Position[] = []
  
  for (const move of possibleMoves) {
    const testBoard = cloneBoard(board)
    testBoard[move.row][move.col] = testBoard[pos.row][pos.col]
    testBoard[pos.row][pos.col] = null
    
    if (!isInCheck(testBoard, piece.color)) {
      validMoves.push(move)
    }
  }
  
  return validMoves
}

export const hasLegalMoves = (board: Board, color: PieceColor, lastMove: Move | null): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, lastMove)
        if (moves.length > 0) return true
      }
    }
  }
  return false
}

export const makeMove = (
  board: Board,
  from: Position,
  to: Position,
  lastMove: Move | null,
  promotionType?: PieceType
): { newBoard: Board; move: Move } => {
  const newBoard = cloneBoard(board)
  const piece = newBoard[from.row][from.col]!
  const captured = newBoard[to.row][to.col]
  
  const move: Move = {
    from,
    to,
    piece: { ...piece },
    captured: captured ? { ...captured } : undefined
  }
  
  if (piece.type === 'pawn') {
    if (lastMove && lastMove.piece.type === 'pawn' && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
      if (to.col === lastMove.to.col && to.row !== lastMove.to.row) {
        if (Math.abs(from.col - lastMove.to.col) === 1 && from.row === lastMove.to.row) {
          move.isEnPassant = true
          move.captured = newBoard[lastMove.to.row][lastMove.to.col]!
          newBoard[lastMove.to.row][lastMove.to.col] = null
        }
      }
    }
    
    const promotionRow = piece.color === 'white' ? 0 : 7
    if (to.row === promotionRow) {
      move.promotion = promotionType || 'queen'
      piece.type = move.promotion
    }
  }
  
  if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
    move.isCastling = true
    if (to.col === 6) {
      newBoard[to.row][5] = newBoard[to.row][7]
      newBoard[to.row][7] = null
      if (newBoard[to.row][5]) newBoard[to.row][5]!.hasMoved = true
    } else if (to.col === 2) {
      newBoard[to.row][3] = newBoard[to.row][0]
      newBoard[to.row][0] = null
      if (newBoard[to.row][3]) newBoard[to.row][3]!.hasMoved = true
    }
  }
  
  newBoard[to.row][to.col] = { ...piece, hasMoved: true }
  newBoard[from.row][from.col] = null
  
  return { newBoard, move }
}
