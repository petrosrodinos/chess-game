import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayConnection
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { GameService } from './game.service'
import { SocketEvents } from './constants/socket-events.constants'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import { GetGameDto } from './dto/get-game.dto'
import { SyncGameDto } from './dto/sync-game.dto'

@WebSocketGateway({
    cors: {
        origin: process.env.APP_URL,
        credentials: true
    }
})
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer()
    server: Server

    private readonly logger = new Logger(GameGateway.name)
    private clientGameMap = new Map<string, string>()

    constructor(private readonly gameService: GameService) {
        this.logger.log('GameGateway initialized')
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`)
    }

    async handleDisconnect(client: Socket): Promise<void> {
        this.logger.log(`Client disconnected: ${client.id}`)

        const gameCode = this.clientGameMap.get(client.id)
        if (!gameCode) return

        this.clientGameMap.delete(client.id)

        const room = this.server.sockets.adapter.rooms.get(gameCode)
        const roomSize = room?.size ?? 0

        if (roomSize > 0) {
            this.server.to(gameCode).emit(SocketEvents.PLAYER_LEFT, { message: 'Your opponent has left the game.' })
        }

        if (roomSize === 0) {
            await this.gameService.deleteGame(gameCode)
        }
    }



    @SubscribeMessage(SocketEvents.CREATE_GAME)
    async handleCreateGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateGameDto
    ): Promise<void> {
        try {
            const gameSession = await this.gameService.createGame(payload)

            await client.join(gameSession.code)
            this.trackClientGame(client.id, gameSession.code)

            this.logger.log(`Game created: ${gameSession.code} by ${payload.playerName}`)

            client.emit(SocketEvents.CREATE_GAME, gameSession)
        } catch (error) {
            this.logger.error(`Error creating game: ${error.message}`)
            client.emit(SocketEvents.ERROR, { message: error.message })
        }
    }

    @SubscribeMessage(SocketEvents.JOIN_GAME)
    async handleJoinGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinGameDto
    ): Promise<void> {
        try {
            const gameSession = await this.gameService.joinGame(payload)

            await client.join(gameSession.code)
            this.trackClientGame(client.id, gameSession.code)

            this.logger.log(`Player ${payload.playerName} joined game: ${gameSession.code}`)

            this.server.to(gameSession.code).emit(SocketEvents.PLAYER_JOINED, gameSession)

            if (gameSession.players.length === 2) {
                this.server.to(gameSession.code).emit(SocketEvents.GAME_START, gameSession)
            }
        } catch (error) {
            this.logger.error(`Error joining game: ${error.message}`)
            client.emit(SocketEvents.ERROR, { message: error.message })
        }
    }

    @SubscribeMessage(SocketEvents.GET_GAME)
    async handleGetGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: GetGameDto
    ): Promise<void> {
        try {
            const gameSession = await this.gameService.getGame(payload)

            const room = this.server.sockets.adapter.rooms.get(gameSession.code)
            const roomSize = room?.size ?? 0

            // if (roomSize >= 2) {
            //     client.emit(SocketEvents.ERROR, { message: 'Game is full.' })
            //     return
            // }

            await client.join(gameSession.code)
            this.trackClientGame(client.id, gameSession.code)

            client.emit(SocketEvents.GAME_STATE, gameSession)

            const joiningPlayer = gameSession.players.find(p => p.id === payload.playerId)
            client.to(gameSession.code).emit(SocketEvents.PLAYER_JOINED, {
                ...gameSession,
                joinedPlayerId: joiningPlayer?.id
            })
        } catch (error) {
            this.logger.error(`Error getting game: ${error.message}`)
            client.emit(SocketEvents.ERROR, { message: error.message })
        }
    }

    @SubscribeMessage(SocketEvents.SYNC_GAME)
    async handleSyncGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SyncGameDto
    ): Promise<void> {
        try {
            const gameSession = await this.gameService.updateGameState(
                payload.code,
                payload.gameState as any
            )

            this.logger.log(`Game synced: ${payload.code}`)

            client.to(gameSession.code).emit(SocketEvents.GAME_UPDATE, gameSession)
        } catch (error) {
            this.logger.error(`Error syncing game: ${error.message}`)
            client.emit(SocketEvents.ERROR, { message: error.message })
        }
    }

    @SubscribeMessage(SocketEvents.LEAVE_GAME)
    async handleLeaveGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { code: string }
    ): Promise<void> {
        this.logger.log(`[LEAVE_GAME] Received from ${client.id}`)

        const gameCode = payload.code
        if (!gameCode) {
            return
        }

        this.clientGameMap.delete(client.id)
        client.leave(gameCode)

        const room = this.server.sockets.adapter.rooms.get(gameCode)
        const roomSize = room?.size ?? 0


        if (roomSize > 0) {
            this.server.to(gameCode).emit(SocketEvents.PLAYER_LEFT, { message: 'Your opponent has left the game.' })
        }

        if (roomSize === 0) {
            await this.gameService.deleteGame(gameCode)
        }
    }

    private trackClientGame(clientId: string, gameCode: string): void {
        this.clientGameMap.set(clientId, gameCode)
    }
}
