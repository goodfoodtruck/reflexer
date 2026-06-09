import { useState } from "react"
import { UserService } from "@services/user.service"
import type { PlayerSearchResult } from "@services/user.service"

export function usePlayerSearch(currentUserId: string | undefined) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<PlayerSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const search = async () => {
        if (query.trim() === "") return
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
    }

    return { 
        query, 
        setQuery, 
        results, 
        loading, 
        error, 
        search 
    }
}