import { IsString, IsObject, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SyncGameDto {
    @ApiProperty({ description: 'Game code', example: 'ABC123' })
    @IsString()
    code: string

    @ApiProperty({ description: 'Full game state from client' })
    @IsObject()
    gameState: Record<string, unknown>

    @ApiProperty({ description: 'Sound key to play on opponent client', required: false })
    @IsOptional()
    @IsString()
    soundKey?: string
}
