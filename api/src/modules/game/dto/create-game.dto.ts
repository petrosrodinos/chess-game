import { IsString, IsIn, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { BoardSizeKeys, BoardSizeKey, PlayerColors, PlayerColor } from '../constants/game.constants'

const BOARD_SIZE_VALUES = Object.values(BoardSizeKeys)
const PLAYER_COLOR_VALUES = Object.values(PlayerColors)

class GameBoardStateDto {
    @ApiProperty({ description: 'Board state' })
    @IsArray()
    board: unknown[][]

    @ApiProperty({ description: 'Board size key', enum: BOARD_SIZE_VALUES })
    @IsIn(BOARD_SIZE_VALUES)
    boardSizeKey: BoardSizeKey

    @ApiProperty({ description: 'Move history' })
    @IsArray()
    moveHistory: unknown[]

    @ApiProperty({ description: 'Captured pieces' })
    capturedPieces: { white: unknown[]; black: unknown[] }

    @ApiProperty({ description: 'Last move' })
    @IsOptional()
    lastMove: unknown | null

    @ApiProperty({ description: 'Game over flag' })
    @IsBoolean()
    gameOver: boolean

    @ApiProperty({ description: 'Winner' })
    @IsOptional()
    @IsIn([...PLAYER_COLOR_VALUES, null])
    winner: PlayerColor | null
}

export class CreateGameDto {
    @ApiProperty({ description: 'Player ID' })
    @IsString()
    playerId: string

    @ApiProperty({ description: 'Player name', example: 'Player1' })
    @IsString()
    playerName: string

    @ApiProperty({
        description: 'Board size key',
        enum: BOARD_SIZE_VALUES,
        default: BoardSizeKeys.SMALL
    })
    @IsOptional()
    @IsIn(BOARD_SIZE_VALUES)
    boardSizeKey?: BoardSizeKey

    @ApiProperty({ description: 'Initial game state with board' })
    @IsOptional()
    @ValidateNested()
    @Type(() => GameBoardStateDto)
    gameState?: GameBoardStateDto
}
