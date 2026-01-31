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
        origin: '*',
        credentials: true
    }
})
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer()
    server: Server

    private readonly logger = new Logger(GameGateway.name)

    constructor(private readonly gameService: GameService) {
        this.logger.log('GameGateway initialized')
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`)
    }

    @SubscribeMessage(SocketEvents.CREATE_GAME)
    async handleCreateGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateGameDto
    ): Promise<void> {
        this.logger.log(`[CREATE_GAME] Received from ${client.id}: ${JSON.stringify(payload)}`)
        try {
            const gameSession = await this.gameService.createGame(payload)

            await client.join(gameSession.code)

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
        this.logger.log(`[JOIN_GAME] Received from ${client.id}: ${JSON.stringify(payload)}`)
        try {
            const gameSession = await this.gameService.joinGame(payload)

            await client.join(gameSession.code)

            this.logger.log(`Player ${payload.playerName} joined game: ${gameSession.code}`)

            this.server.to(gameSession.code).emit(SocketEvents.PLAYER_JOINED, gameSession)

            if (gameSession.players.length === 2) {
                this.logger.log(`Game ${gameSession.code} is starting with both players`)
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
        this.logger.log(`[GET_GAME] Received from ${client.id}: ${JSON.stringify(payload)}`)
        try {
            const gameSession = await this.gameService.getGame(payload)

            await client.join(gameSession.code)

            this.logger.log(`Player fetched game: ${gameSession.code}`)

            client.emit(SocketEvents.GAME_STATE, gameSession)
            this.logger.log(`[GET_GAME] Emitted GAME_STATE to ${client.id}`)
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
        this.logger.log(`[SYNC_GAME] Received from ${client.id}: ${JSON.stringify(payload)}`)
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
}
