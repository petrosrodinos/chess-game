import { useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { environments } from '../../config/environments'

export const Login = () => {
    const [username, setUsername] = useState('')
    const navigate = useNavigate()
    const setUser = useAuthStore(state => state.setUser)

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return
        setUser(username.trim())
        navigate('/home')
    }, [username, setUser, navigate])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50">
                    <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                        {environments.APP_NAME}
                    </h1>
                    <p className="text-stone-400 text-center mb-8">Enter the battlefield</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-stone-300 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-600 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
                        >
                            Enter Game
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
