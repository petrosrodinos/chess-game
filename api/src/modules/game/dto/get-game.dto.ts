import { IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GetGameDto {
    @ApiProperty({ description: 'Game code', example: 'ABC123' })
    @IsString()
    code: string

    @ApiProperty({ description: 'Player ID', required: false })
    @IsOptional()
    @IsString()
    playerId?: string
}
