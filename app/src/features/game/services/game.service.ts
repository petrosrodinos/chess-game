import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type { CreateGameRequest, JoinGameRequest, GameSession } from '../interfaces'

export const createGame = async (data: CreateGameRequest): Promise<GameSession> => {
    try {
        const response = await axiosInstance.post<GameSession>(ApiRoutes.games.create, data)
        return response.data
    } catch (error) {
        throw error
    }
}

export const joinGame = async (data: JoinGameRequest): Promise<GameSession> => {
    try {
        const response = await axiosInstance.post<GameSession>(ApiRoutes.games.join, data)
        return response.data
    } catch (error) {
        throw error
    }
}

export const getGame = async (code: string): Promise<GameSession> => {
    try {
        const response = await axiosInstance.get<GameSession>(ApiRoutes.games.get(code))
        return response.data
    } catch (error) {
        throw error
    }
}
