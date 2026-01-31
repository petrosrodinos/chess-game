import { io, Socket } from 'socket.io-client'
import { environments } from '../config/environments'

let socket: Socket | null = null

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(environments.API_URL.replace(/\/$/, ''), {
            autoConnect: false,
            transports: ['websocket', 'polling']
        })
    }
    return socket
}

export const connectSocket = (): Socket => {
    const socketInstance = getSocket()
    if (!socketInstance.connected) {
        socketInstance.connect()
    }
    return socketInstance
}

export const disconnectSocket = (): void => {
    if (socket?.connected) {
        socket.disconnect()
    }
}
