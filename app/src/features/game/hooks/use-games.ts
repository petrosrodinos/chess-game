import { useMutation, useQuery } from '@tanstack/react-query'
import { createGame, getGame, joinGame } from '../services'

export const useCreateGame = () => {
    return useMutation({
        mutationFn: createGame,
    })
}

export const useJoinGame = () => {
    return useMutation({
        mutationFn: joinGame,
    })
}

export const useGetGame = (code: string) => {
    return useQuery({
        queryKey: ['game', code],
        queryFn: () => getGame(code),
    })
}
