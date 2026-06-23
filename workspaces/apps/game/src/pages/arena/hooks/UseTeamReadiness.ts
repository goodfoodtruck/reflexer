import { useState, useEffect } from "react"
import { TeamService, type TeamReadiness } from "@services/team.service"

export function useTeamReadiness() {
    const [readiness, setReadiness] = useState<TeamReadiness | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        TeamService.checkReadiness()
            .then(setReadiness)
            .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
            .finally(() => setLoading(false))
    }, [])

    return { readiness, loading, error }
}