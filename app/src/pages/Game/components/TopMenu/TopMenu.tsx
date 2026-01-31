import type { BoardSizeKey, PlayerColor } from '../../types'
import { BotDifficulties, BoardSizeKeys, PlayerColors } from '../../types'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { useGameMode } from '../../../../hooks'
import type { Player } from '../../../../features/game/interfaces'

interface TopMenuProps {
    isOnline?: boolean
    gameCode?: string | null
    players?: Player[]
    currentPlayer?: Player
    currentTurnPlayer?: Player
    isMyTurn?: boolean
    gameOver?: boolean
    winner?: PlayerColor | null
}

export const TopMenu = ({
    isOnline = false,
    players = [],
    currentPlayer,
    currentTurnPlayer,
    isMyTurn = false,
    gameOver: onlineGameOver,
    winner: onlineWinner
}: TopMenuProps) => {
    const {
        gameState,
        boardSizeKey,
        botEnabled,
        botThinking,
        botDifficulty,
        resetGame,
        toggleBot,
        setDifficulty
    } = useGameStore()

    const { is3D, toggle3D, devMode, toggleDevMode, closeTopMenu } = useUIStore()
    const { showBot, showDev } = useGameMode()

    const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
        resetGame(sizeKey)
        closeTopMenu()
    }

    const whitePlayer = players.find(p => p.color === PlayerColors.WHITE)
    const blackPlayer = players.find(p => p.color === PlayerColors.BLACK)
    const winnerPlayer = onlineWinner ? players.find(p => p.color === onlineWinner) : null

    const gameOver = isOnline ? onlineGameOver : gameState.gameOver

    const getStatusText = () => {
        if (isOnline) {
            if (gameOver && winnerPlayer) {
                return `${winnerPlayer.name} Wins!`
            }
            if (gameOver) {
                return 'Game Over'
            }
            if (!currentTurnPlayer) {
                return 'Waiting for players...'
            }
            if (isMyTurn) {
                return 'Your Turn'
            }
            return `${currentTurnPlayer.name}'s Turn`
        }

        if (gameState.gameOver && gameState.winner) {
            return `${gameState.winner === PlayerColors.WHITE ? 'White' : 'Black'} Wins!`
        }
        if (gameState.gameOver) {
            return 'Game Over'
        }
        return `${gameState.currentPlayer === PlayerColors.WHITE ? 'White' : 'Black'}'s Turn`
    }

    const getStatusColor = () => {
        if (gameOver) {
            return 'bg-rose-600 text-white'
        }
        const currentColor = isOnline ? currentTurnPlayer?.color : gameState.currentPlayer
        if (currentColor === PlayerColors.WHITE) {
            return 'bg-white text-stone-900 border border-stone-300'
        }
        return 'bg-stone-900 text-white border border-stone-600'
    }

    return (
        <div className="bg-stone-800/80 backdrop-blur rounded-xl p-3 border border-stone-700">
            <div className="flex flex-wrap items-end gap-4 justify-center">
                {isOnline && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-stone-200 text-sm font-medium">
                                {whitePlayer?.name || 'Waiting...'}
                            </span>
                            {currentPlayer?.color === PlayerColors.WHITE && (
                                <span className="text-amber-400 text-xs">(You)</span>
                            )}
                        </div>
                        <span className="text-stone-500">vs</span>
                        <div className="flex items-center gap-2">
                            <span className="text-stone-200 text-sm font-medium">
                                {blackPlayer?.name || 'Waiting...'}
                            </span>
                            {currentPlayer?.color === PlayerColors.BLACK && (
                                <span className="text-amber-400 text-xs">(You)</span>
                            )}
                        </div>
                    </div>
                )}

                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-amber-200">View</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggle3D}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${is3D ? 'bg-violet-600' : 'bg-stone-600'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${is3D ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-xs text-stone-300">{is3D ? '3D' : '2D'}</span>
                    </div>
                </div>

                {!isOnline && (
                    <>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-amber-200">Size</span>
                            <select
                                value={boardSizeKey}
                                onChange={(e) => handleBoardSizeChange(e.target.value as BoardSizeKey)}
                                className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1.5 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            >
                                <option value={BoardSizeKeys.SMALL}>Small (12×12)</option>
                                <option value={BoardSizeKeys.MEDIUM}>Medium (12×16)</option>
                                <option value={BoardSizeKeys.LARGE}>Large (12×20)</option>
                            </select>
                        </div>

                        {showBot && (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium text-amber-200">Bot</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleBot}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${botEnabled ? 'bg-emerald-600' : 'bg-stone-600'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${botEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                    {botEnabled && (
                                        <select
                                            value={botDifficulty}
                                            onChange={(e) => setDifficulty(e.target.value as typeof botDifficulty)}
                                            className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                        >
                                            <option value={BotDifficulties.EASY}>Easy</option>
                                            <option value={BotDifficulties.MEDIUM}>Medium</option>
                                            <option value={BotDifficulties.HARD}>Hard</option>
                                        </select>
                                    )}
                                    {botThinking && (
                                        <span className="text-xs text-stone-400">Thinking...</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {showDev && (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium text-orange-400">Dev</span>
                                <button
                                    onClick={toggleDevMode}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${devMode ? 'bg-orange-600' : 'bg-stone-600'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${devMode ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
