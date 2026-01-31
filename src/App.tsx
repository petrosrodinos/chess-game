import { useState } from 'react'
import { useGame, Board, Board3D, GameInfo } from './features/chess'
import type { BoardSizeKey } from './features/chess/types'

function App() {
  const [is3D, setIs3D] = useState(true)

  const {
    gameState,
    boardSizeKey,
    botEnabled,
    botThinking,
    botDifficulty,
    canUndo,
    hintMove,
    canHint,
    selectSquare,
    resetGame,
    toggleBot,
    setDifficulty,
    undoMove,
    showHint
  } = useGame()

  const toggle3D = () => setIs3D(prev => !prev)

  const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
    resetGame(sizeKey)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        <div className="order-2 lg:order-1">
          <GameInfo
            currentPlayer={gameState.currentPlayer}
            gameOver={gameState.gameOver}
            winner={gameState.winner}
            capturedPieces={gameState.capturedPieces}
            moveHistory={gameState.moveHistory}
            botEnabled={botEnabled}
            botThinking={botThinking}
            botDifficulty={botDifficulty}
            canUndo={canUndo}
            canHint={canHint}
            is3D={is3D}
            boardSizeKey={boardSizeKey}
            onReset={() => resetGame()}
            onToggleBot={toggleBot}
            onDifficultyChange={setDifficulty}
            onUndo={undoMove}
            onHint={showHint}
            onToggle3D={toggle3D}
            onBoardSizeChange={handleBoardSizeChange}
          />
        </div>

        <div className="order-1 lg:order-2">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
            Fantasy Tactics
          </h1>
          {is3D ? (
            <Board3D
              board={gameState.board}
              boardSize={gameState.boardSize}
              selectedPosition={gameState.selectedPosition}
              validMoves={gameState.validMoves}
              validAttacks={gameState.validAttacks}
              lastMove={gameState.lastMove}
              hintMove={hintMove}
              onSquareClick={selectSquare}
            />
          ) : (
            <Board
              board={gameState.board}
              boardSize={gameState.boardSize}
              selectedPosition={gameState.selectedPosition}
              validMoves={gameState.validMoves}
              validAttacks={gameState.validAttacks}
              lastMove={gameState.lastMove}
              hintMove={hintMove}
              onSquareClick={selectSquare}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
