import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class JoinGameDto {
    @ApiProperty({ description: 'Game code', example: 'ABC123' })
    @IsString()
    @Length(6, 6)
    code: string

    @ApiProperty({ description: 'Player ID' })
    @IsString()
    playerId: string

    @ApiProperty({ description: 'Player name', example: 'Player2' })
    @IsString()
    playerName: string
}
