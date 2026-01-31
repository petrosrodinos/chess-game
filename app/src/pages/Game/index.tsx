import { useEffect } from 'react'
import { Settings, Info, Loader2 } from 'lucide-react'
import { Board } from './components/Board'
import { Board3D } from './components/Board3D'
import { TopMenu } from './components/TopMenu'
import { BottomMenu } from './components/BottomMenu'
import { RightSidebar } from './components/RightSidebar'
import { Modal } from '../../components/Modal'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useGameMode, useOnlineGame } from '../../hooks'
import { PlayerColors } from './types'
import { BOT_DELAY } from './constants'
import { environments } from '../../config/environments'
import { GameModes } from '../../constants'

export const Game = () => {
    const { mode } = useGameMode()
    const isOnline = mode === GameModes.ONLINE

    const { gameState, botEnabled, botDifficulty, botThinking, processBotMove } = useGameStore()
    const { is3D, isTopMenuOpen, isRightMenuOpen, openTopMenu, closeTopMenu, openRightMenu, closeRightMenu } = useUIStore()

    const {
        gameSession,
        gameCode,
        board: onlineBoard,
        boardSize: onlineBoardSize,
        selectedPosition: onlineSelectedPosition,
        validMoves: onlineValidMoves,
        validAttacks: onlineValidAttacks,
        lastMove: onlineLastMove,
        capturedPieces: onlineCapturedPieces,
        moveHistory: onlineMoveHistory,
        gameOver: onlineGameOver,
        winner: onlineWinner,
        currentPlayer,
        currentTurnPlayer,
        isMyTurn,
        isLoading,
        error,
        handleSquareClick
    } = useOnlineGame()

    useEffect(() => {
        if (isOnline) return
        if (!botEnabled) return
        if (gameState.currentPlayer !== PlayerColors.BLACK) return
        if (gameState.gameOver) return
        if (botThinking) return

        const timer = setTimeout(() => {
            processBotMove()
        }, BOT_DELAY[botDifficulty])

        return () => clearTimeout(timer)
    }, [isOnline, botEnabled, botDifficulty, gameState.currentPlayer, gameState.gameOver, botThinking, processBotMove])

    if (isOnline && isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                    <p className="text-amber-200 text-lg">Loading game...</p>
                </div>
            </div>
        )
    }

    if (isOnline && error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
                <div className="bg-rose-600/20 border border-rose-500 rounded-xl p-6 max-w-md">
                    <h2 className="text-rose-400 text-xl font-bold mb-2">Error</h2>
                    <p className="text-stone-200">{error}</p>
                </div>
            </div>
        )
    }

    const gameOver = isOnline ? onlineGameOver : gameState.gameOver
    const winner = isOnline ? onlineWinner : gameState.winner
    const winnerPlayer = isOnline && winner ? gameSession?.players.find(p => p.color === winner) : null

    const getMobileStatusText = (): string => {
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
            return `${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`
        }
        if (gameState.gameOver) {
            return 'Game Over'
        }
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`
    }

    const getMobileStatusColor = (): string => {
        if (gameOver) {
            return 'bg-rose-600 text-white'
        }
        if (isOnline && isMyTurn) {
            return 'bg-emerald-600 text-white'
        }
        if (isOnline && !isMyTurn) {
            return 'bg-amber-600 text-white'
        }
        return 'bg-emerald-600 text-white'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                    {environments.APP_NAME}
                </h1>

                <div className="lg:hidden mb-4">
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${getMobileStatusColor()}`}>
                        {getMobileStatusText()}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-2 items-start justify-center">
                    <div className="flex flex-col items-center">
                        <div className="hidden lg:block mb-2">
                            <TopMenu
                                isOnline={isOnline}
                                gameCode={gameCode}
                                players={gameSession?.players}
                                currentPlayer={currentPlayer}
                                currentTurnPlayer={currentTurnPlayer}
                                isMyTurn={isMyTurn}
                                gameOver={onlineGameOver}
                                winner={onlineWinner}
                            />
                        </div>

                        {is3D ? (
                            <Board3D
                                isOnline={isOnline}
                                onlineBoard={onlineBoard}
                                onlineBoardSize={onlineBoardSize}
                                onlineSelectedPosition={onlineSelectedPosition}
                                onlineValidMoves={onlineValidMoves}
                                onlineValidAttacks={onlineValidAttacks}
                                onlineLastMove={onlineLastMove}
                                onSquareClick={handleSquareClick}
                            />
                        ) : (
                            <Board
                                isOnline={isOnline}
                                onlineBoard={onlineBoard}
                                onlineBoardSize={onlineBoardSize}
                                onlineSelectedPosition={onlineSelectedPosition}
                                onlineValidMoves={onlineValidMoves}
                                onlineValidAttacks={onlineValidAttacks}
                                onlineLastMove={onlineLastMove}
                                onSquareClick={handleSquareClick}
                            />
                        )}

                        {!isOnline && <BottomMenu />}
                    </div>

                    <div className="hidden lg:block flex-shrink-0">
                        <RightSidebar
                            isOnline={isOnline}
                            onlineBoardSize={onlineBoardSize}
                            onlineCapturedPieces={onlineCapturedPieces}
                            onlineMoveHistory={onlineMoveHistory}
                        />
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
                    title={isOnline ? 'Game Info' : 'Game Settings'}
                >
                    <TopMenu
                        isOnline={isOnline}
                        gameCode={gameCode}
                        players={gameSession?.players}
                        currentPlayer={currentPlayer}
                        currentTurnPlayer={currentTurnPlayer}
                        isMyTurn={isMyTurn}
                        gameOver={onlineGameOver}
                        winner={onlineWinner}
                    />
                </Modal>

                <Modal
                    isOpen={isRightMenuOpen}
                    onClose={closeRightMenu}
                    title="Game Info"
                >
                    <RightSidebar
                        isOnline={isOnline}
                        onlineBoardSize={onlineBoardSize}
                        onlineCapturedPieces={onlineCapturedPieces}
                        onlineMoveHistory={onlineMoveHistory}
                    />
                </Modal>
            </div>
        </div>
    )
}
