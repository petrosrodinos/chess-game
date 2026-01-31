import { useEffect } from 'react'
import { Settings, Info } from 'lucide-react'
import { Board } from './components/Board'
import { Board3D } from './components/Board3D'
import { TopMenu } from './components/TopMenu'
import { BottomMenu } from './components/BottomMenu'
import { RightSidebar } from './components/RightSidebar'
import { Modal } from '../../components/Modal'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { PlayerColors } from './types'
import { BOT_DELAY } from './constants'
import { environments } from '../../config/environments'

export const Game = () => {
  const { gameState, botEnabled, botDifficulty, botThinking, processBotMove } = useGameStore()
  const { is3D, isTopMenuOpen, isRightMenuOpen, openTopMenu, closeTopMenu, openRightMenu, closeRightMenu } = useUIStore()

  // Bot move effect
  useEffect(() => {
    if (!botEnabled) return
    if (gameState.currentPlayer !== PlayerColors.BLACK) return
    if (gameState.gameOver) return
    if (botThinking) return

    const timer = setTimeout(() => {
      processBotMove()
    }, BOT_DELAY[botDifficulty])

    return () => clearTimeout(timer)
  }, [botEnabled, botDifficulty, gameState.currentPlayer, gameState.gameOver, botThinking])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
          {environments.APP_NAME}
        </h1>

        <div className="lg:hidden mb-4">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
            gameState.gameOver
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {gameState.gameOver && gameState.winner
              ? `${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`
              : gameState.gameOver
              ? 'Game Over'
              : `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 items-start justify-center">
          <div className="flex flex-col items-center w-full">
            <div className="hidden lg:block  mb-2">
              <TopMenu />
            </div>

            {is3D ? <Board3D /> : <Board />}

            <BottomMenu />
          </div>

          <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>

        <div className="fixed bottom-20 right-4 lg:hidden flex flex-col gap-2 z-40">
          <button
            onClick={openTopMenu}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Open game settings"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={openRightMenu}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Open game info"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>

        <Modal
          isOpen={isTopMenuOpen}
          onClose={closeTopMenu}
          title="Game Settings"
        >
          <TopMenu />
        </Modal>

        <Modal
          isOpen={isRightMenuOpen}
          onClose={closeRightMenu}
          title="Game Info"
        >
          <RightSidebar />
        </Modal>
      </div>
    </div>
  )
}

