import type { Board, Piece, Position, Move, PieceColor, PieceType, BoardSize } from '../types'
import { isPiece, PieceColors, PieceTypes } from '../types'
import { isInBounds, cloneBoard, isSquareBlockedByObstacle } from './boardUtils'

const getPawnMoves = (board: Board, pos: Position, piece: Piece, lastMove: Move | null, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const direction = piece.color === PieceColors.WHITE ? -1 : 1
  const startRow = piece.color === PieceColors.WHITE ? boardSize.rows - 2 : 1
  
  if (isInBounds(pos.row + direction, pos.col, boardSize) && 
      !board[pos.row + direction][pos.col] &&
      !isSquareBlockedByObstacle(board, pos.row + direction, pos.col)) {
    moves.push({ row: pos.row + direction, col: pos.col })
    
    if (pos.row === startRow && 
        !board[pos.row + 2 * direction][pos.col] &&
        !isSquareBlockedByObstacle(board, pos.row + 2 * direction, pos.col)) {
      moves.push({ row: pos.row + 2 * direction, col: pos.col })
    }
  }
  
  for (const colOffset of [-1, 1]) {
    const newCol = pos.col + colOffset
    const newRow = pos.row + direction
    if (isInBounds(newRow, newCol, boardSize)) {
      if (isSquareBlockedByObstacle(board, newRow, newCol)) continue
      const target = board[newRow][newCol]
      if (target && isPiece(target) && target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  if (lastMove && lastMove.piece.type === PieceTypes.PAWN) {
    const movedTwoSquares = Math.abs(lastMove.from.row - lastMove.to.row) === 2
    if (movedTwoSquares && lastMove.to.row === pos.row) {
      if (Math.abs(lastMove.to.col - pos.col) === 1) {
        const epRow = pos.row + direction
        if (!isSquareBlockedByObstacle(board, epRow, lastMove.to.col)) {
          moves.push({ row: epRow, col: lastMove.to.col })
        }
      }
    }
  }
  
  return moves
}

const getKnightMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  
  for (const [rowOff, colOff] of offsets) {
    const newRow = pos.row + rowOff
    const newCol = pos.col + colOff
    if (isInBounds(newRow, newCol, boardSize)) {
      if (isSquareBlockedByObstacle(board, newRow, newCol)) continue
      const target = board[newRow][newCol]
      if (!target || (isPiece(target) && target.color !== piece.color)) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

const getSlidingMoves = (board: Board, pos: Position, piece: Piece, directions: number[][], boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  
  for (const [rowDir, colDir] of directions) {
    let newRow = pos.row + rowDir
    let newCol = pos.col + colDir
    
    while (isInBounds(newRow, newCol, boardSize)) {
      if (isSquareBlockedByObstacle(board, newRow, newCol)) break
      
      const target = board[newRow][newCol]
      if (!target) {
        moves.push({ row: newRow, col: newCol })
      } else if (isPiece(target)) {
        if (target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      } else {
        break
      }
      newRow += rowDir
      newCol += colDir
    }
  }
  
  return moves
}

const getBishopMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  return getSlidingMoves(board, pos, piece, [[-1, -1], [-1, 1], [1, -1], [1, 1]], boardSize)
}

const getRookMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  return getSlidingMoves(board, pos, piece, [[-1, 0], [1, 0], [0, -1], [0, 1]], boardSize)
}

const getQueenMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  return [
    ...getBishopMoves(board, pos, piece, boardSize),
    ...getRookMoves(board, pos, piece, boardSize)
  ]
}

const getKingMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]
  
  for (const [rowOff, colOff] of offsets) {
    const newRow = pos.row + rowOff
    const newCol = pos.col + colOff
    if (isInBounds(newRow, newCol, boardSize)) {
      if (isSquareBlockedByObstacle(board, newRow, newCol)) continue
      const target = board[newRow][newCol]
      if (!target || (isPiece(target) && target.color !== piece.color)) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

export const findKing = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === PieceTypes.KING && cell.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const isSquareUnderAttack = (board: Board, pos: Position, defendingColor: PieceColor, boardSize: BoardSize): boolean => {
  const attackingColor = defendingColor === PieceColors.WHITE ? PieceColors.BLACK : PieceColors.WHITE
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === attackingColor) {
        let moves: Position[]
        if (cell.type === PieceTypes.PAWN) {
          const direction = cell.color === PieceColors.WHITE ? -1 : 1
          moves = []
          for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset
            const newRow = row + direction
            if (isInBounds(newRow, newCol, boardSize)) {
              if (!isSquareBlockedByObstacle(board, newRow, newCol)) {
                moves.push({ row: newRow, col: newCol })
              }
            }
          }
        } else if (cell.type === PieceTypes.KING) {
          moves = getKingMoves(board, { row, col }, cell, boardSize)
        } else {
          moves = getPieceMoves(board, { row, col }, null, boardSize)
        }
        
        if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
          return true
        }
      }
    }
  }
  return false
}

export const isInCheck = (board: Board, color: PieceColor, boardSize: BoardSize): boolean => {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  return isSquareUnderAttack(board, kingPos, color, boardSize)
}

const getCastlingMoves = (board: Board, _pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  if (piece.hasMoved) return moves
  
  const row = piece.color === PieceColors.WHITE ? boardSize.rows - 1 : 0
  const kingCol = Math.floor(boardSize.cols / 2)
  
  const kingSideRook = board[row][boardSize.cols - 1]
  if (kingSideRook && isPiece(kingSideRook) && kingSideRook.type === PieceTypes.ROOK && !kingSideRook.hasMoved) {
    let canCastle = true
    for (let col = kingCol + 1; col < boardSize.cols - 1; col++) {
      if (board[row][col] || isSquareBlockedByObstacle(board, row, col)) {
        canCastle = false
        break
      }
    }
    if (canCastle) {
      if (!isSquareUnderAttack(board, { row, col: kingCol }, piece.color, boardSize) &&
          !isSquareUnderAttack(board, { row, col: kingCol + 1 }, piece.color, boardSize) &&
          !isSquareUnderAttack(board, { row, col: kingCol + 2 }, piece.color, boardSize)) {
        moves.push({ row, col: kingCol + 2 })
      }
    }
  }
  
  const queenSideRook = board[row][0]
  if (queenSideRook && isPiece(queenSideRook) && queenSideRook.type === PieceTypes.ROOK && !queenSideRook.hasMoved) {
    let canCastle = true
    for (let col = 1; col < kingCol; col++) {
      if (board[row][col] || isSquareBlockedByObstacle(board, row, col)) {
        canCastle = false
        break
      }
    }
    if (canCastle) {
      if (!isSquareUnderAttack(board, { row, col: kingCol }, piece.color, boardSize) &&
          !isSquareUnderAttack(board, { row, col: kingCol - 1 }, piece.color, boardSize) &&
          !isSquareUnderAttack(board, { row, col: kingCol - 2 }, piece.color, boardSize)) {
        moves.push({ row, col: kingCol - 2 })
      }
    }
  }
  
  return moves
}

export const getPieceMoves = (board: Board, pos: Position, lastMove: Move | null, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []
  
  let moves: Position[] = []
  
  switch (cell.type) {
    case PieceTypes.PAWN:
      moves = getPawnMoves(board, pos, cell, lastMove, boardSize)
      break
    case PieceTypes.KNIGHT:
      moves = getKnightMoves(board, pos, cell, boardSize)
      break
    case PieceTypes.BISHOP:
      moves = getBishopMoves(board, pos, cell, boardSize)
      break
    case PieceTypes.ROOK:
      moves = getRookMoves(board, pos, cell, boardSize)
      break
    case PieceTypes.QUEEN:
      moves = getQueenMoves(board, pos, cell, boardSize)
      break
    case PieceTypes.KING:
      moves = [...getKingMoves(board, pos, cell, boardSize), ...getCastlingMoves(board, pos, cell, boardSize)]
      break
  }
  
  return moves
}

export const getValidMoves = (board: Board, pos: Position, lastMove: Move | null, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []
  
  const possibleMoves = getPieceMoves(board, pos, lastMove, boardSize)
  const validMoves: Position[] = []
  
  for (const move of possibleMoves) {
    const testBoard = cloneBoard(board)
    testBoard[move.row][move.col] = testBoard[pos.row][pos.col]
    testBoard[pos.row][pos.col] = null
    
    if (!isInCheck(testBoard, cell.color, boardSize)) {
      validMoves.push(move)
    }
  }
  
  return validMoves
}

export const hasLegalMoves = (board: Board, color: PieceColor, lastMove: Move | null, boardSize: BoardSize): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === color) {
        const moves = getValidMoves(board, { row, col }, lastMove, boardSize)
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
  boardSize: BoardSize,
  promotionType?: PieceType
): { newBoard: Board; move: Move } => {
  const newBoard = cloneBoard(board)
  const cell = newBoard[from.row][from.col]
  if (!cell || !isPiece(cell)) {
    throw new Error('No piece at source position')
  }
  const piece = cell
  const targetCell = newBoard[to.row][to.col]
  const captured = targetCell && isPiece(targetCell) ? targetCell : undefined
  
  const move: Move = {
    from,
    to,
    piece: { ...piece },
    captured: captured ? { ...captured } : undefined
  }
  
  if (piece.type === PieceTypes.PAWN) {
    if (lastMove && lastMove.piece.type === PieceTypes.PAWN && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
      if (to.col === lastMove.to.col && to.row !== lastMove.to.row) {
        if (Math.abs(from.col - lastMove.to.col) === 1 && from.row === lastMove.to.row) {
          move.isEnPassant = true
          const epCell = newBoard[lastMove.to.row][lastMove.to.col]
          if (epCell && isPiece(epCell)) {
            move.captured = epCell
          }
          newBoard[lastMove.to.row][lastMove.to.col] = null
        }
      }
    }
    
    const promotionRow = piece.color === PieceColors.WHITE ? 0 : boardSize.rows - 1
    if (to.row === promotionRow) {
      move.promotion = promotionType || PieceTypes.QUEEN
      piece.type = move.promotion
    }
  }
  
  if (piece.type === PieceTypes.KING && Math.abs(from.col - to.col) === 2) {
    move.isCastling = true
    const kingCol = Math.floor(boardSize.cols / 2)
    if (to.col > kingCol) {
      newBoard[to.row][to.col - 1] = newBoard[to.row][boardSize.cols - 1]
      newBoard[to.row][boardSize.cols - 1] = null
      const rookCell = newBoard[to.row][to.col - 1]
      if (rookCell && isPiece(rookCell)) {
        rookCell.hasMoved = true
      }
    } else {
      newBoard[to.row][to.col + 1] = newBoard[to.row][0]
      newBoard[to.row][0] = null
      const rookCell = newBoard[to.row][to.col + 1]
      if (rookCell && isPiece(rookCell)) {
        rookCell.hasMoved = true
      }
    }
  }
  
  newBoard[to.row][to.col] = { ...piece, hasMoved: true }
  newBoard[from.row][from.col] = null
  
  return { newBoard, move }
}
