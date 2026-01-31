import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { GameService } from './game.service'
import { SocketEvents } from './constants/socket-events.constants'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true
    }
})
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private readonly logger = new Logger(GameGateway.name)

    constructor(private readonly gameService: GameService) { }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`)
    }

    @SubscribeMessage(SocketEvents.CREATE_GAME)
    async handleCreateGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateGameDto
    ): Promise<void> {
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
}
