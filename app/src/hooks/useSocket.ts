import { useEffect, useRef, useCallback, useState } from 'react'
import { Socket } from 'socket.io-client'
import { connectSocket } from '../lib/socket'

interface UseSocketReturn {
    socket: Socket | null
    isConnected: boolean
    connectionError: Error | null
    emit: <T>(event: string, data: T) => void
    on: <T>(event: string, callback: (data: T) => void) => void
    off: (event: string) => void
}

export const useSocket = (): UseSocketReturn => {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<Error | null>(null)

    useEffect(() => {
        const socket = connectSocket()
        socketRef.current = socket

        const handleConnect = (): void => {
            setIsConnected(true)
            setConnectionError(null)
        }

        const handleDisconnect = (): void => {
            setIsConnected(false)
        }

        const handleConnectError = (error: Error): void => {
            setConnectionError(error)
            setIsConnected(false)
        }

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)
        socket.on('connect_error', handleConnectError)

        if (socket.connected) {
            setIsConnected(true)
        }

        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
            socket.off('connect_error', handleConnectError)
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
        connectionError,
        emit,
        on,
        off
    }
}
