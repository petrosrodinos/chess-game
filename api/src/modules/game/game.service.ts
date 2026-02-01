import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CacheService } from '@/shared/services/cache/cache.service'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import { GetGameDto } from './dto/get-game.dto'
import {
    GameSession
} from './interfaces/game.interface'
import {
    BOARD_SIZES,
    GAME_TTL,
    BoardSizeKeys,
    BoardSizeKey,
    GameStatuses,
    PlayerColors
} from './constants/game.constants'
import { generateGameCode, getGameKey } from './helpers/game.helper'

@Injectable()
export class GameService {
    constructor(private readonly cacheService: CacheService) { }

    async createGame(dto: CreateGameDto): Promise<GameSession> {
        const code = generateGameCode()
        const boardSizeKey: BoardSizeKey = dto?.boardSizeKey || BoardSizeKeys.SMALL

        const gameState = {
            board: dto.gameState?.board,
            currentPlayer: PlayerColors.WHITE,
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null,
            gameOver: false,
            winner: null
        }

        const gameSession: GameSession = {
            code,
            boardSizeKey,
            boardSize: BOARD_SIZES[boardSizeKey],
            status: GameStatuses.WAITING,
            players: [
                {
                    id: dto.playerId,
                    name: dto.playerName,
                    color: PlayerColors.WHITE,
                    joinedAt: new Date()
                }
            ],
            createdAt: new Date(),
            hostPlayerId: dto.playerId,
            gameState
        }

        await this.cacheService.set(getGameKey(code), gameSession, GAME_TTL)

        return gameSession
    }

    async joinGame(dto: JoinGameDto): Promise<GameSession> {
        const gameSession = await this.getGameSession(dto.code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        const existingPlayer = gameSession.players.find(p => p.id === dto.playerId)

        if (existingPlayer) {
            return gameSession
        }

        if (gameSession.status !== GameStatuses.WAITING) {
            throw new BadRequestException('Game already started or finished')
        }

        // if (gameSession.players.length >= 2) {
        //     throw new BadRequestException('Game is full')
        // }

        const updatedGameSession: GameSession = {
            ...gameSession,
            status: GameStatuses.IN_PROGRESS,
            players: [
                ...gameSession.players,
                {
                    id: dto.playerId,
                    name: dto.playerName,
                    color: PlayerColors.BLACK,
                    joinedAt: new Date()
                }
            ]
        }

        await this.cacheService.set(
            getGameKey(dto.code),
            updatedGameSession,
            GAME_TTL
        )

        return updatedGameSession
    }

    async getGame(dto: GetGameDto): Promise<GameSession> {
        const gameSession = await this.getGameSession(dto.code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        return gameSession
    }

    async updateGameState(code: string, gameState: GameSession['gameState']): Promise<GameSession> {
        const gameSession = await this.getGameSession(code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        const updatedGameSession: GameSession = {
            ...gameSession,
            gameState: {
                board: gameState?.board,
                currentPlayer: gameState?.currentPlayer,
                moveHistory: gameState?.moveHistory,
                capturedPieces: gameState?.capturedPieces,
                lastMove: gameState?.lastMove,
                gameOver: gameState?.gameOver,
                winner: gameState?.winner
            },
            status: gameState?.gameOver ? GameStatuses.FINISHED : gameSession.status
        }

        await this.cacheService.set(
            getGameKey(code),
            updatedGameSession,
            GAME_TTL
        )

        return updatedGameSession
    }

    async deleteGame(code: string): Promise<void> {
        await this.cacheService.delete(getGameKey(code))
    }

    private async getGameSession(code: string): Promise<GameSession | undefined> {
        return this.cacheService.get<GameSession>(getGameKey(code))
    }
}
