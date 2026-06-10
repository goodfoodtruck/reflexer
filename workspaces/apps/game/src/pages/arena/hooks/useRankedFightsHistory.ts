import { useState, useEffect } from "react"
import { RankedFightService, type RankedFight } from "@services/fight/rankedFight.service"

export function useRankedFightsHistory(userId: string) {
    const [fights, setFights] = useState<RankedFight[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await RankedFightService.getHistory(userId)                
                setFights(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur de chargement")
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [userId])

    return { fights, loading, error }
}