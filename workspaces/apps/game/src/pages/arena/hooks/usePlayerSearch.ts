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

export const usePlayerSearch = (currentUserId: string | undefined) => {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<PlayerSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useDebounce(async () => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }

        setError(null)
        setLoading(true)

        try {
            const data = await UserService.search(query.trim())
            setResults(data.filter(player => player._id !== currentUserId))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur de recherche")
        } finally {
            setLoading(false)
        }
    }, 300, [query])

    return { query, setQuery, results, loading, error }
}