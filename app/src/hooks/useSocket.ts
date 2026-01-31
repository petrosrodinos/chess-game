import { useEffect, useRef, useCallback, useState } from 'react'
import { Socket } from 'socket.io-client'
import { connectSocket } from '../lib/socket'

interface UseSocketReturn {
    socket: Socket | null
    isConnected: boolean
    emit: <T>(event: string, data: T) => void
    on: <T>(event: string, callback: (data: T) => void) => void
    off: (event: string) => void
}

export const useSocket = (): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const socket = connectSocket()
        socketRef.current = socket

        const handleConnect = (): void => {
            setIsConnected(true)
        }

        const handleDisconnect = (): void => {
            setIsConnected(false)
        }

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)

        if (socket.connected) {
            setIsConnected(true)
        }

        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
        }
    }, [])

    const emit = useCallback(<T,>(event: string, data: T): void => {
        socketRef.current?.emit(event, data)
    }, [])

    const on = useCallback(<T,>(event: string, callback: (data: T) => void): void => {
        socketRef.current?.on(event, callback as (...args: unknown[]) => void)
    }, [])

    const off = useCallback((event: string): void => {
        socketRef.current?.off(event)
    }, [])

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off
    }
}
