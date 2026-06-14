import { UserRankingService, type UserRankingResponse } from "@services/userRanking.service"
import { useEffect, useState } from "react"

export function useUserRanking(userId: string) {
    const [userRanking, setUserRanking] = useState<UserRankingResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPlayerRanking = async () => {
            try {
                const data = await UserRankingService.getByUserId(userId)                                
                setUserRanking(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur de chargement")
            } finally {
                setLoading(false)
            }
        }

        fetchPlayerRanking()
    }, [userId])

    return { userRanking, loading, error }
}