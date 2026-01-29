import { useChessGame } from './hooks/useChessGame'
import { Board } from './components/Board/Board'
import { GameInfo } from './components/GameInfo/GameInfo'
import { PromotionModal } from './components/PromotionModal/PromotionModal'

function App() {
  const { gameState, pendingPromotion, botEnabled, botThinking, botDifficulty, canUndo, hintMove, canHint, selectSquare, promotePawn, resetGame, toggleBot, setDifficulty, undoMove, showHint } = useChessGame()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        <div className="order-2 lg:order-1">
          <GameInfo
            currentPlayer={gameState.currentPlayer}
            isCheck={gameState.isCheck}
            isCheckmate={gameState.isCheckmate}
            isStalemate={gameState.isStalemate}
            capturedPieces={gameState.capturedPieces}
            moveHistory={gameState.moveHistory}
            botEnabled={botEnabled}
            botThinking={botThinking}
            botDifficulty={botDifficulty}
            canUndo={canUndo}
            canHint={canHint}
            onReset={resetGame}
            onToggleBot={toggleBot}
            onDifficultyChange={setDifficulty}
            onUndo={undoMove}
            onHint={showHint}
          />
        </div>

        <div className="order-1 lg:order-2">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
            Chess
          </h1>
          <Board
            board={gameState.board}
            selectedPosition={gameState.selectedPosition}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            hintMove={hintMove}
            onSquareClick={selectSquare}
          />
        </div>
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={gameState.currentPlayer}
          onSelect={promotePawn}
        />
      )}
    </div>
  )
}

export default App
