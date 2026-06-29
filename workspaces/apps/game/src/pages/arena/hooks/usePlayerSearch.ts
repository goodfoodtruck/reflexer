import { UserService } from "@services/user.service"
import type { PlayerSearchResult } from "@services/user.service"
import { useEffect, useRef, useState } from "react"

const useDebounce = (callback: () => void, delay: number, deps: unknown[]) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(callback, delay)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, deps)
}

export const usePlayerSearch = (currentUserId: string) => {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<PlayerSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const requestIdRef = useRef(0)

    useDebounce(async () => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }

        const requestId = ++requestIdRef.current

        setError(null)
        setLoading(true)

        try {
            const data = await UserService.search(query.trim())
            if (requestId !== requestIdRef.current) return
            setResults(data.filter(player => player._id !== currentUserId))
        } catch (err) {
            if (requestId !== requestIdRef.current) return
            setError(err instanceof Error ? err.message : "Erreur de recherche")
        } finally {
            if (requestId === requestIdRef.current) setLoading(false)
        }
    }, 400, [query])

    return { query, setQuery, results, loading, error }
}