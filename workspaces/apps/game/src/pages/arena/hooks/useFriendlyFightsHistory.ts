import { useState, useEffect } from "react"
import { FriendlyFightService } from "@services/fight/friendlyFight.service"
import type { FriendlyFight } from "@shared/fight.types"

export function useFriendlyFightsHistory(userId: string) {
    const [fights, setFights] = useState<FriendlyFight[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await FriendlyFightService.getHistory(userId)
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