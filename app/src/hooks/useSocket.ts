import { useEffect, useRef, useCallback, useState } from 'react'
import { Socket } from 'socket.io-client'
import { connectSocket, disconnectSocket } from '../lib/socket'

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
        socketRef.current = connectSocket()

        const handleConnect = (): void => {
            setIsConnected(true)
        }

        const handleDisconnect = (): void => {
            setIsConnected(false)
        }

        socketRef.current.on('connect', handleConnect)
        socketRef.current.on('disconnect', handleDisconnect)

        if (socketRef.current.connected) {
            setIsConnected(true)
        }

        return () => {
            socketRef.current?.off('connect', handleConnect)
            socketRef.current?.off('disconnect', handleDisconnect)
            disconnectSocket()
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
